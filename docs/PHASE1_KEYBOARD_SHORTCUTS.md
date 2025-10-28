# LifeSync Phase 1 - Keyboard Shortcuts Quick Reference

## FloatingToolbar

| Shortcut | Action | Notes |
|----------|--------|-------|
| **Tab** | Navigate to toolbar | Focus from page to toolbar |
| **Arrow Down** | Next tool | Cycles through 6 tools, announces selection |
| **Arrow Up** | Previous tool | Cycles backwards, wraps to last |
| **Arrow Right** | Next tool | Alternative to Arrow Down |
| **Arrow Left** | Previous tool | Alternative to Arrow Up |
| **Home** | First tool | Jump to first tool, announces |
| **End** | Last tool | Jump to last tool (ID Validator), announces |
| **Enter** | Activate tool | Executes tool action or opens modal |
| **Space** | Activate tool | Alternative to Enter |
| **Escape** | Minimize toolbar | Closes toolbar, announces "minimized" |

### When Toolbar Minimized
| Shortcut | Action |
|----------|--------|
| **Tab** | Navigate to expand button |
| **Enter/Space** | Expand toolbar |

### ID Validator Modal (When Open)
| Shortcut | Action |
|----------|--------|
| **Tab** | Cycle through modal elements |
| **Shift+Tab** | Cycle backwards |
| **Enter** | Validate ID (on button) |
| **Escape** | Close modal, return focus |

### Guest Management Modal (When Open)
| Shortcut | Action |
|----------|--------|
| **Tab** | Cycle through modal elements |
| **Shift+Tab** | Cycle backwards |
| **Enter** | Activate button |
| **Escape** | Close modal |

---

## Dashboard

### Tab Navigation
| Shortcut | Action | Notes |
|----------|--------|-------|
| **Alt+Tab** | Switch tabs | Personal ↔ Professional |
| **Arrow Right** | Next tab | From focused tab button |
| **Arrow Left** | Previous tab | From focused tab button |

### Tool Navigation (Main List)
| Shortcut | Action | Notes |
|----------|--------|-------|
| **Tab** | Navigate to first tool | From tab area |
| **Arrow Down** | Next tool | Announces "Item N of X" |
| **Arrow Up** | Previous tool | Backwards navigation |
| **Home** | First tool | Jump to start |
| **End** | Last tool | Jump to end of current tab |
| **Enter** | Activate tool | Navigate to tool page |

### Category Management
| Shortcut | Action | Notes |
|----------|--------|-------|
| **Tab** | Navigate to category header | Headers are focusable |
| **Enter** | Expand/collapse category | Tools below show/hide |
| **Space** | Expand/collapse category | Alternative to Enter |

### Tab Order
- Tab moves: Tabs → Categories → Tools → Next category → etc.
- Tools in collapsed categories are skipped
- Full logical order maintained

---

## GuestManagement

### Button Actions
| Shortcut | Action | Context |
|----------|--------|---------|
| **Tab** | Navigate between buttons | All buttons reachable |
| **Enter** | Activate button | Download, Renew, etc. |
| **Space** | File picker | On file input labels |
| **Shift+Tab** | Previous button | Backward navigation |

### Session States
| State | Display |
|-------|---------|
| **Active** | Blue panel with countdown |
| **Expired** | Yellow panel with renewal option |

---

## Global Controls

| Shortcut | Function | Support |
|----------|----------|---------|
| **Tab** | Navigate forward | All browsers |
| **Shift+Tab** | Navigate backward | All browsers |
| **Enter/Space** | Activate buttons | All browsers |
| **Escape** | Close/minimize | Modals, toolbar |
| **Arrow Keys** | Navigate lists | Custom implementation |
| **Home/End** | Jump to boundaries | Custom implementation |

---

## Screen Reader Announcements

### FloatingToolbar
- **Open:** "Toolbar expanded, use arrow keys to navigate tools"
- **Selection:** "Selected [Tool Name], [Description]"
- **Activation:** "Activated [Tool Name]"
- **Modal Open:** "[Modal Title]" (e.g., "ID Validator Modal")
- **Modal Close:** "[Modal Title] modal closed"
- **Minimize:** "Toolbar minimized"

### Dashboard
- **Tab Switch:** "[Tab Name] tab selected"
- **Tool Selection:** "Item N of X [Tool Name] [Description]"
- **Category Toggle:** "[Category] expanded/collapsed"
- **Initial:** "Personal tab selected" (on load)

### GuestManagement
- **Active Session:** "Guest Session Active, N days remaining"
- **Expired Session:** "Guest Session Expired"
- **Action:** "[Action] completed" (e.g., "Session renewed")

---

## Accessibility Indicators

### Visual Indicators
- **Focus Ring:** Blue ring around focused element
- **Active Tab:** White/highlighted background
- **Active Tool:** Blue background with selection
- **Category Expanded:** Chevron pointing down

### ARIA Attributes
- `aria-label`: Descriptive label for element
- `aria-selected="true/false"`: Tab selection state
- `aria-expanded="true/false"`: Category expansion state
- `aria-modal="true"`: Modal dialogs
- `role="list"`: Tool containers
- `role="listitem"`: Individual tools
- `role="tab"`: Tab buttons
- `role="tablist"`: Tab group

---

## Common User Flows

### Flow 1: Keyboard-Only Navigation (No Mouse)
1. Tab to FloatingToolbar area
2. Press Arrow Down to select tools
3. Press Enter to activate
4. Dialog/page opens and responds to keyboard
5. Escape closes dialogs
6. Focus returns to toolbar

### Flow 2: Dashboard Tool Access
1. Tab to Dashboard tabs
2. Alt+Tab to switch between Personal/Professional
3. Tab to first tool or use Arrow Down
4. Press Home/End to jump to boundaries
5. Enter activates selected tool

### Flow 3: Category Management
1. Tab to category header
2. Press Enter to expand
3. Arrow Down to first tool in category
4. Navigate as normal
5. Enter to activate

### Flow 4: Modal Interaction
1. Tool activation opens modal
2. Focus automatically in modal
3. Tab cycles through modal elements
4. Tab after last element cycles to first
5. Escape closes modal
6. Focus returns to toolbar/page

---

## Tips for Users

### For Keyboard-Only Users
- Use **Home/End** to jump quickly between tools
- Use **Arrow keys** to navigate lists smoothly
- Use **Tab** for fastest forward navigation
- Use **Shift+Tab** to go backwards
- Press **Escape** if you get stuck (clears modals)

### For Screen Reader Users
- Announcements guide you through each action
- Focus is always announced when it changes
- Tool names and descriptions are read automatically
- Modal titles tell you where you are
- Use **Arrow keys** within lists for faster navigation

### For Power Users
- **Alt+Tab** is fastest way to switch dashboard tabs
- **Home/End** jump to list boundaries instantly
- **Enter** is quickest way to activate
- All actions work without mouse

---

## Keyboard Layout Reference

### Standard Keyboard
```
    Esc   F1   F2  ...        PrSc  ScrLk  Pause
     ~    !    @   #    $    %    ^    &    *    (    )    _    +   Backspace
    Tab   Q    W   E    R    T    Y    U    I    O    P    {    }    |
   Caps   A    S   D    F    G    H    J    K    L    :    "            Enter
   Shift  Z    X   C    V    B    N    M    <    >    ?              Shift
    Ctrl  Win  Alt                 Space              Alt  Win  Menu  Ctrl
```

### Key Placement (Common)
- **Arrow Keys**: Lower right (standard layout)
- **Home/End**: Above arrow keys
- **Tab**: Left side, top row
- **Escape**: Top left corner
- **Enter**: Right side (large key)

---

## Browser Compatibility

### Tested & Supported
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Screen Readers
- ✅ NVDA (Windows)
- ✅ JAWS (Windows)
- ✅ VoiceOver (macOS)
- ✅ Chrome/Firefox built-in readers

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Focus stuck in modal** | Press Escape to close modal |
| **Can't hear announcements** | Check screen reader is running |
| **Focus ring not visible** | Try pressing Tab (keyboard focus only) |
| **Keyboard not responding** | Refresh page, click on component first |
| **Tab order seems wrong** | Check if modal is open (focus trapped) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 19, 2024 | Initial Phase 1 implementation |

---

## For More Information

- **Full Testing Guide:** See `PHASE1_SCREEN_READER_TESTING.md`
- **Test Cases:** See `src/__tests__/keyboard.test.js`
- **Implementation Details:** See `PHASE1_COMPLETION_SUMMARY.md`
- **WCAG Standards:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/

---

**Last Updated:** December 19, 2024  
**Status:** Phase 1 Complete - Ready for Testing
