import React from 'react';

const CustomizationPanel = ({
                                modelOptions,
                                currentSelections,
                                onOptionChange,
                                activeColorPalette,
                                activeColorNames
                            }) => {

    if (!modelOptions) return <div>Немає опцій для кастомізації.</div>;


    const textureConfig = modelOptions['texture_faasade'];
    const colorConfig = modelOptions['color_faasade'];

    return (
        <div className="customization-panel">
            <h3>Опції Кастомізації</h3>

            {/* --- Texture Selection --- */}
            {textureConfig && (
                <div className="option-group">
                    <label htmlFor="texture_select">Текстура Фасаду:</label>
                    <select
                        id="texture_select"
                        value={currentSelections['texture_faasade']?.value || textureConfig.defaultValue}
                        onChange={(e) => onOptionChange(
                            'texture_faasade', // optionName
                            textureConfig.materialName,
                            textureConfig.type,
                            e.target.value // the selected texture path
                        )}
                    >
                        {textureConfig.values.map((textureOption) => (
                            <option key={textureOption.path} value={textureOption.path}>
                                {textureOption.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* --- Color Selection (uses active palette) --- */}
            {colorConfig && activeColorPalette && (
                <div className="option-group">
                    <label>Колір Фасаду:</label>
                    {activeColorPalette.length > 0 ? (
                        <div className="color-swatches">
                            {activeColorPalette.map((colorValue, index) => {
                                const colorName = activeColorNames && activeColorNames[index] ? activeColorNames[index] : colorValue;
                                return (
                                    <button
                                        key={colorValue + '-' + index} // Ensure unique key if colors repeat across palettes
                                        className={`swatch ${currentSelections['color_faasade']?.value === colorValue ? 'selected' : ''}`}
                                        style={{ backgroundColor: colorValue }}
                                        title={colorName} // Use name for tooltip
                                        onClick={() => onOptionChange(
                                            'color_faasade', // optionName
                                            colorConfig.materialName,
                                            colorConfig.type,
                                            colorValue // the selected color hex
                                        )}
                                        aria-label={`Вибрати колір ${colorName}`}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p>Немає доступних кольорів для вибраної текстури.</p>
                    )}
                </div>
            )}

            {/* Render other options if any */}

        </div>
    );
};

export default CustomizationPanel;