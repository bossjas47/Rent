/**
 * Theme Presets - ธีมสำเร็จรูปสำหรับ PanderX
 */

const themePresets = {
    default: {
        name: 'Default (Sky Blue)',
        primary: '#0ea5e9',
        secondary: '#6366f1',
        accent: '#f59e0b',
        bg: '#f0f9ff',
        text: '#1e293b',
        textMuted: '#64748b',
        headerBg: '#ffffff',
        footerBg: '#f8fafc',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    ocean: {
        name: 'Ocean Blue',
        primary: '#0369a1',
        secondary: '#0284c7',
        accent: '#06b6d4',
        bg: '#f0f9ff',
        text: '#0c2340',
        textMuted: '#0f766e',
        headerBg: '#ffffff',
        footerBg: '#ecf0f1',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    forest: {
        name: 'Forest Green',
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399',
        bg: '#ecfdf5',
        text: '#064e3b',
        textMuted: '#047857',
        headerBg: '#f0fdf4',
        footerBg: '#e0f2fe',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    sunset: {
        name: 'Sunset Orange',
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#fb923c',
        bg: '#fff7ed',
        text: '#7c2d12',
        textMuted: '#92400e',
        headerBg: '#ffffff',
        footerBg: '#fef3c7',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    midnight: {
        name: 'Midnight Purple',
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#d946ef',
        bg: '#faf5ff',
        text: '#3f0f5c',
        textMuted: '#6b21a8',
        headerBg: '#ffffff',
        footerBg: '#f3e8ff',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    rose: {
        name: 'Rose Pink',
        primary: '#e11d48',
        secondary: '#f43f5e',
        accent: '#fb7185',
        bg: '#fff1f2',
        text: '#831843',
        textMuted: '#be185d',
        headerBg: '#ffffff',
        footerBg: '#ffe4e6',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    emerald: {
        name: 'Emerald Green',
        primary: '#0d9488',
        secondary: '#14b8a6',
        accent: '#2dd4bf',
        bg: '#f0fdfa',
        text: '#134e4a',
        textMuted: '#0f766e',
        headerBg: '#ffffff',
        footerBg: '#ccfbf1',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    indigo: {
        name: 'Indigo Deep',
        primary: '#4f46e5',
        secondary: '#6366f1',
        accent: '#818cf8',
        bg: '#f0f4ff',
        text: '#1e1b4b',
        textMuted: '#312e81',
        headerBg: '#ffffff',
        footerBg: '#e0e7ff',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    amber: {
        name: 'Amber Gold',
        primary: '#b45309',
        secondary: '#d97706',
        accent: '#f59e0b',
        bg: '#fffbeb',
        text: '#78350f',
        textMuted: '#92400e',
        headerBg: '#ffffff',
        footerBg: '#fef3c7',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    },
    cyan: {
        name: 'Cyan Bright',
        primary: '#0891b2',
        secondary: '#06b6d4',
        accent: '#22d3ee',
        bg: '#ecf0ff',
        text: '#164e63',
        textMuted: '#0e7490',
        headerBg: '#ffffff',
        footerBg: '#cffafe',
        fontFamily: 'Prompt,sans-serif',
        fontSize: 16
    }
};

const themeDefaults = themePresets.default;

/**
 * Get all preset names
 */
function getPresetNames() {
    return Object.keys(themePresets).filter(k => k !== 'default');
}

/**
 * Get preset by name
 */
function getPreset(name) {
    return themePresets[name] || themeDefaults;
}
