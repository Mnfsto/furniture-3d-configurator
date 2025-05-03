import React from 'react';


function CustomizationPanel({
                                modelOptions,
                                currentSelections,
                                onOptionChange,
                                activeColorPalette,
                                activeColorNames,
                                disabled = false
                            }) {

    const textureConfig = modelOptions?.texture_faasade;
    const colorConfig = modelOptions?.color_faasade;


    const handleRadioChange = (optionName, materialName, type, value) => {
        if (!disabled) {
            onOptionChange(optionName, materialName, type, value);
        }
    };

    return (
        <div className={`customization-panel ${disabled ? 'disabled' : ''}`}>


            {textureConfig?.values && (
                <fieldset className="option-group texture-group">
                    <legend className="group-legend">{textureConfig.displayName || 'Текстура Матеріалу'}</legend>
                    <div className="options-container texture-options">
                        {textureConfig.values.map((textureOption, index) => {
                            const id = `texture-option-${index}`;
                            const isSelected = currentSelections.texture_faasade?.value === textureOption.path;
                            return (
                                <div className="option-item-texture" key={id}>
                                    <input
                                        type="radio"
                                        id={id}
                                        name="texture_faasade_option"
                                        value={textureOption.path}
                                        checked={isSelected}
                                        onChange={() => handleRadioChange(
                                            'texture_faasade',
                                            textureConfig.materialName,
                                            'texture',
                                            textureOption.path
                                        )}
                                        disabled={disabled}
                                        className="option-radio-input"
                                    />
                                    <label htmlFor={id} className="option-label texture-label" title={textureOption.name || textureOption.path}>
                                        <img
                                            src={textureOption.thumbnail || textureOption.path}
                                            alt={textureOption.name || 'Текстура'}
                                            loading="lazy"
                                        />
                                        {isSelected && <span className="selected-checkmark">✔</span>}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            )}

            {/* --- Выбор Цвета --- */}
            {colorConfig && activeColorPalette && (
                <fieldset className="option-group color-group">
                    <legend className="group-legend">{colorConfig.displayName || 'Колір Матеріалу'}</legend>
                    {activeColorPalette.length > 0 ? (
                        <div className="options-container color-options">
                            {activeColorPalette.map((colorValue, index) => {
                                const colorName = activeColorNames?.[index] ?? colorValue;
                                const id = `color-option-${index}-${colorValue.replace('#','')}`;
                                const isSelected = currentSelections.color_faasade?.value === colorValue;
                                return (
                                    <div className="option-item-color" key={id}>
                                        <input
                                            type="radio"
                                            id={id}
                                            name="color_faasade_option"
                                            value={colorValue}
                                            checked={isSelected}
                                            onChange={() => handleRadioChange(
                                                'color_faasade',
                                                colorConfig.materialName,
                                                'color',
                                                colorValue
                                            )}
                                            disabled={disabled}
                                            className="option-radio-input"
                                        />
                                        <label
                                            htmlFor={id}
                                            className="option-label color-label"
                                            title={colorName}
                                            style={{ backgroundColor: colorValue }}
                                            aria-label={`Вибрати колір ${colorName}`}
                                        >
                                            {isSelected && <span className="selected-checkmark">✔</span>}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="no-options-message">Немає доступних кольорів для вибраної текстури.</p>
                    )}
                </fieldset>
            )}
        </div>
    );
}

export default CustomizationPanel;