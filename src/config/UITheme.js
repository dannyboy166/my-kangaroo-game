/**
 * Centralized UI Theme configuration
 * All fonts, colors, and common UI values in one place
 */

export const UI_THEME = {
    // Font configurations
    fonts: {
        family: 'Carter One',

        // Size presets
        sizes: {
            title: '42px',
            subtitle: '26px',
            button: '24px',
            buttonLarge: '34px',
            buttonSmall: '18px',
            body: '20px',
            small: '14px',
            tiny: '12px'
        }
    },

    // Color palette
    colors: {
        // Text colors
        white: '#FFFFFF',
        gold: '#FFD700',
        black: '#000000',
        darkGray: '#333333',
        gray: '#666666',
        lightGray: '#CCCCCC',

        // UI accent colors
        green: '#4CAF50',

        // Powerup colors (for orbs, progress bars, inventory)
        powerup: {
            shield: '#FF69B4',      // Pink
            magnet: '#00BFFF',      // Blue
            doubleJump: '#00FF00'   // Green
        }
    },

    // Common text styles (ready to spread into Phaser text config)
    textStyles: {
        title: {
            fontSize: '42px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        },
        subtitle: {
            fontSize: '26px',
            fontFamily: 'Carter One',
            color: '#4CAF50',
            stroke: '#000000',
            strokeThickness: 2
        },
        button: {
            fontSize: '24px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        },
        buttonLarge: {
            fontSize: '34px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        },
        buttonSmall: {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        },
        body: {
            fontSize: '20px',
            fontFamily: 'Carter One',
            color: '#000000'
        },
        coinCount: {
            fontSize: '24px',
            fontFamily: 'Carter One',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        },
        score: {
            fontSize: '26px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        },
        hint: {
            fontSize: '12px',
            fontFamily: 'Carter One',
            color: '#666666',
            fontStyle: 'italic'
        }
    },

    // Common UI element scales
    scales: {
        buttonSmall: 0.35,
        buttonMedium: 0.45,
        buttonLarge: 0.7,
        icon: 0.4,
        iconSmall: 0.35,
        coinIcon: 0.6,
        ribbon: 0.7
    },

    // Common spacing values
    spacing: {
        iconGap: 8,
        buttonTextOffsetY: -5
    },

    // Fixed UI element positions (consistent across all scenes)
    positions: {
        coinDisplay: { x: 45, y: 30 }
    },

    // Common button presets (for quick use)
    buttonPresets: {
        primary: {
            bgKey: 'btn_green',
            bgScale: 0.5,
            textStyle: { fontSize: '24px' }
        },
        secondary: {
            bgKey: 'btn_blue',
            bgScale: 0.45,
            textStyle: { fontSize: '22px' }
        },
        danger: {
            bgKey: 'btn_red',
            bgScale: 0.45,
            textStyle: { fontSize: '22px' }
        }
    }
};

/**
 * Helper to create a text style with overrides
 * @param {string} preset - Name of preset from textStyles
 * @param {Object} overrides - Properties to override
 * @returns {Object} Merged text style
 */
export function getTextStyle(preset, overrides = {}) {
    const base = UI_THEME.textStyles[preset] || UI_THEME.textStyles.body;
    return { ...base, ...overrides };
}

/**
 * Helper to get button preset config with overrides
 * @param {string} preset - Name of preset (primary, secondary, danger)
 * @param {Object} overrides - Properties to override
 * @returns {Object} Merged button config
 */
export function getButtonPreset(preset, overrides = {}) {
    const base = UI_THEME.buttonPresets[preset] || UI_THEME.buttonPresets.primary;
    return { ...base, ...overrides };
}
