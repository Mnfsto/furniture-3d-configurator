import React from 'react';

function CustomizationPanel({
                                modelOptions,
                                currentSelections,
                                onOptionChange,
                                disabled = false,
                                selectedPart,
                                setSelectedPart,
                                setTextureIndex,
                                setCurrentTexturePath,
                                setCurrentMaterial,
                                updateActiveColors,
                                setCurrentColorIndex,
                            }) {

    const handleRadioChange = (optionName, materialName, type, value) => {
        if (disabled) return;
        const part = modelOptions.configurableParts.find((p) => p.key === selectedPart);
        const oppositeKey = type === 'texture' ? part.colorOptionKey : part.textureOptionKey;
        onOptionChange(optionName, materialName, type, value, oppositeKey);
    };

    const handlePartChange = (partKey) => {
        setSelectedPart(partKey);
        // Не нужно вручную сбрасывать состояние, этим займется useEffect в Configurator
    };

    const partOptions = modelOptions.configurableParts.map((part) => ({
        key: part.key,
        name: part.displayName,
        thumbnail: `/assets/part-thumbnails/${part.key}.jpg`,
    }));

    const part = modelOptions.configurableParts.find((p) => p.key === selectedPart);
    const textureConfig = modelOptions.options[part?.textureOptionKey];
    const colorConfig = modelOptions.options[part?.colorOptionKey];

    const activeTextureValue = currentSelections[part?.textureOptionKey]?.value;
    const activeColorValue = currentSelections[part?.colorOptionKey]?.value;

    return (
        <div className={`customization-panel ${disabled ? 'disabled' : ''}`}>
            {partOptions.length > 1 && (
                <fieldset className="option-group part-group">
                    <legend className="group-legend">Елемент</legend>
                    <div className="options-container part-options">
                        {partOptions.map((partOption) => {
                            const id = `part-option-${partOption.key}`;
                            const isSelected = selectedPart === partOption.key;
                            return (
                                <div className="option-item-part" key={id}>
                                    <input
                                        type="radio"
                                        id={id}
                                        name="part_option"
                                        value={partOption.key}
                                        checked={isSelected}
                                        onChange={() => handlePartChange(partOption.key)}
                                        disabled={disabled}
                                        className="option-input"
                                    />
                                    <label htmlFor={id} className="option-label part-label" title={partOption.name}>
                                        <img src={partOption.thumbnail} alt={partOption.name} loading="lazy" />
                                        {isSelected && <span className="selected-checkmark">✔</span>}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            )}

            {(textureConfig?.values || colorConfig?.values) && (
                <fieldset className="option-group material-group">
                    <legend className="group-legend">Матеріал</legend>
                    <div className="options-container material-options">
                        {textureConfig?.values?.map((textureOption, index) => {
                            const id = `texture-option-${part.key}-${index}`;
                            const isSelected = activeTextureValue === textureOption.path;
                            return (
                                <div className="option-item-texture" key={id}>
                                    <input
                                        type="radio"
                                        id={id}
                                        name={`material_${part.key}`}
                                        value={textureOption.path}
                                        checked={isSelected}
                                        onChange={() =>
                                            handleRadioChange(
                                                part.textureOptionKey,
                                                part.materialName,
                                                'texture',
                                                textureOption.path
                                            )
                                        }
                                        disabled={disabled}
                                        className="option-input"
                                    />
                                    <label
                                        htmlFor={id}
                                        className="option-label material-label texture-label"
                                        title={textureOption.name}
                                    >
                                        <img
                                            src={textureOption.thumbnail || textureOption.path}
                                            alt={textureOption.name}
                                            loading="lazy"
                                        />
                                        {isSelected && <span className="selected-checkmark">✔</span>}
                                    </label>
                                </div>
                            );
                        })}
                        {colorConfig?.values?.map((colorValue, index) => {
                            const colorName = colorConfig.colorName?.[index] ?? colorValue;
                            const id = `color-option-${part.key}-${index}`;
                            const isSelected = activeColorValue === colorValue;
                            return (
                                <div className="option-item-color" key={id}>
                                    <input
                                        type="radio"
                                        id={id}
                                        name={`material_${part.key}`}
                                        value={colorValue}
                                        checked={isSelected}
                                        onChange={() =>
                                            handleRadioChange(
                                                part.colorOptionKey,
                                                part.materialName,
                                                'color',
                                                colorValue
                                            )
                                        }
                                        disabled={disabled}
                                        className="option-input"
                                    />
                                    <label
                                        htmlFor={id}
                                        className="option-label material-label color-label"
                                        title={colorName}
                                        style={{ backgroundColor: colorValue }}
                                        aria-label={`Колір ${colorName}`}
                                    >
                                        {isSelected && <span className="selected-checkmark">✔</span>}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </fieldset>
            )}
        </div>
    );
}

export default CustomizationPanel;