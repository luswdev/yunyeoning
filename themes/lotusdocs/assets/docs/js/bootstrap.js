// Import the Bootstrap components we want to use.
// See https://github.com/twbs/bootstrap/blob/main/js/index.umd.js
import Tab from "/js/bootstrap/src/tab";
import Collapse from "/js/bootstrap/src/collapse";
import Modal from "/js/bootstrap/src/modal";
import Dropdown from "/js/bootstrap/src/dropdown";
import ScrollSpy from "js/bootstrap/src/scrollspy";
import Tooltip from "js/bootstrap/src/tooltip";

export default {
    Tab,
    Collapse,
    Modal,
    Dropdown,
    ScrollSpy,
    Tooltip
}

window.Collapse = Collapse;
window.Tooltip = Tooltip;
window.Modal = Modal;