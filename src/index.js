import i18n from './i18n.js';
import debounce from './debounce.js';
import uid from './uid.js';

// Detect the command key (ctrl for windows / linux, meta for mac)
const CMD_KEY = (
  navigator.userAgentData?.platform
  || navigator.platform
).toLowerCase().startsWith('mac')
  ? 'metaKey'
  : 'ctrlKey';

const rootNode = document.body;

// Randomized class name for our new disabled tweet button
const DISABLED_CLASS_NAME = uid('missing-alt-');
const TWEET_BUTTON_SELECTOR = `[data-testid^=tweetButton]`;
const TWEET_TEXT_AREA_SELECTOR = `[data-testid^=tweetTextarea]`;
const DISABLED_BUTTON_TEXT =  i18n('add-alt-text');
const ATTACHMENT_SELECTOR = '[data-testid="attachments"]';
// CSS Selector to find any groups within Twitter's attachment interface.
// This will find *all* attachment types (images, GIFs, videos)
const ATTACHMENT_GROUP_SELECTOR = `${ATTACHMENT_SELECTOR} [role="group"]`;

// Recursively locate the first text node child for a given element.
const findFirstTextNode = (node) => (  
  (node !== null && node.nodeType !== document.TEXT_NODE)
    ? findFirstTextNode(node.firstChild)
    : node
);

// Add some custom CSS to the page that we will apply to the "Tweet"
// button to signal that alt text needs to be added and prevent the user
// from submitting their Tweet.
document.head.appendChild(Object.assign(document.createElement("style"), {
  innerText: `
    .${DISABLED_CLASS_NAME} {
        background-color: red;
        pointer-events: none;
    }
  `,
}));

// Suppress handling for irrelevant events
const suppressTweetSubmit = (event) => {
  if (
    // Enter key not pressed
    event.key === "Enter"
    // CMD_KEY (ctrl / meta) not held
    && event[CMD_KEY]
    // No active element or active element not tweet text area
    && document.activeElement?.matches(TWEET_TEXT_AREA_SELECTOR)
  ) {
    event.stopImmediatePropagation();
  }
};

const createDisabledTweetButton = (original) => {
  // Make a deep clone of the button. This is what we'll mutate.
  const clone = original.cloneNode(true);
  // @ts-ignore we know this is an HTML element
  clone.classList.add(DISABLED_CLASS_NAME);
  // Find the text node in this button.
  const textNode = findFirstTextNode(clone);
  // If we can't find the text node, just set the textContent on the
  // button itself.This will mess up the styles, but its better than doing
  // nothing.
  if (textNode == null) {
    clone.textContent = DISABLED_BUTTON_TEXT;
  } else {
    textNode.textContent = DISABLED_BUTTON_TEXT;
  }
  return clone;
};

// Initial state of UI extension
const INIT_STATE = {
  // The active tweet button
  button: null,
  // The fake clone we make
  buttonClone: null,
  // The tweet button's original style.display property
  buttonDisplay: null,
};

// Current UI extension state
const state = { ...INIT_STATE };

// Called when we've identified that image attachments
// exist and they are missing required alt text. We want
// to replace the Tweet button with a version of it that
// signals to the user that they need to add alt text.
const reportMissingAlt = () => {
  // If the state has an active button, skip this step
  if (state.button) return;
  state.button = rootNode.querySelector(TWEET_BUTTON_SELECTOR);
  // If for some reason we can't find a Tweet button, do nothing
  if (!state.button) return;
  state.buttonClone = createDisabledTweetButton(state.button);

  // Hide the real button and insert a modified clone
  state.buttonDisplay = state.button.style.display;
  state.button.style.display = "none";

  if (state.button.parentNode) {
    state.button.parentNode.insertBefore(
      state.buttonClone,
      state.button
    );
  }
  // Suppress ctrl+enter / cmd+enter to tweet
  window.addEventListener("keydown", suppressTweetSubmit, { capture: true });
};

const dismissMissingAlt = () => {
  // if we haven't set up the button, there's nothing to do.
  if (!state.button) return;
  // Remove the clone
  state.buttonClone.parentNode.removeChild(state.buttonClone);
  // Reset the button display
  state.button.style.display = state.buttonDisplay;
  // Remove the suppress-submit listener
  window.removeEventListener("keydown", suppressTweetSubmit, { capture: true });
  // Clear the state
  Object.assign(state, INIT_STATE);
};

// Create an observer instance linked to the callback function
new MutationObserver(debounce(() => {
  // Do nothing if there are no attachments on the page
  // use querySelector for a fast-fail
  if (!rootNode.querySelector(ATTACHMENT_GROUP_SELECTOR)) return;
  // Find any attachment groups
  const attachments = rootNode.querySelectorAll(ATTACHMENT_GROUP_SELECTOR);

  // Check each group to see if it's a non-GIF image and whether
  // it already has alt text.
  const hasMissingLabels = [...attachments].some((group) => (
    // Group contains a user-provided image
    group.querySelector('img')
    // Group does not contain an ALT or GIFALT tag
    && !/^(?:GIF)?ALT$/.test(group.querySelector('[aria-describedby]')?.textContent)
  ));
  // UI update is to report if an ALT is missing, or dismiss if not.
  const updateUI = hasMissingLabels
    ? reportMissingAlt
    : dismissMissingAlt;
  // Update the UI; do this out-of-thread to keep the observer's runtime short
  requestAnimationFrame(updateUI);
})).observe(rootNode, { subtree: true, childList: true });
