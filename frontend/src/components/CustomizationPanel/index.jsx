function CustomizationPanel ({modelOptions, currentSelections, onOptionChange}) {
        if (!modelOptions) return <div>Немає опцій для кастомізації.</div>;

        return (

            <div className="customization-panel">
                <h3>Опції Кастомізації</h3>
                {Object.entries(modelOptions).map(([optionName, config]) => (
                    <div key={optionName} className="option-group">
                        <label>{optionName}:</label>
                        {config.type === 'color' && (
                            <div className="color-swatches">
                                {config.values.map((colorValue) => (
                                    <button
                                        key={colorValue}
                                        className={`swatch ${currentSelections[optionName]?.value === colorValue ? 'selected' : ''}`}
                                        style={{backgroundColor: colorValue}}
                                        title={colorValue}
                                        onClick={() => onOptionChange(optionName, config.materialName, config.type, colorValue)}
                                        aria-label={`Вибрати колір ${colorValue}`}
                                    />
                                ))}
                            </div>
                        )}
                        {config.type === 'texture' && (
                            <select
                                value={currentSelections[optionName]?.value || config.defaultValue}
                                onChange={(e) => onOptionChange(optionName, config.materialName, config.type, e.target.value)}
                            >
                                {config.values.map((textureOption) => (
                                    <option key={textureOption.path} value={textureOption.path}>
                                        {textureOption.name}
                                    </option>
                                ))}
                            </select>
                        )}

                    </div>
                ))}
            </div>
        );
};

export default CustomizationPanel;