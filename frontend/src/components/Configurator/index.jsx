import { useParams } from "react-router";
import { getModelData } from "../../config/modelsData";
import { useCallback, useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import hexToRgb from "../../config/hexToRGB";
import CustomizationPanel from "../../components/CustomizationPanel";

const findTextureIndex = (texturePath, textureOptions) => {
    if (!textureOptions || !textureOptions.values) return 0;
    const index = textureOptions.values.findIndex((tex) => tex.path === texturePath);
    return index >= 0 ? index : 0;
};

function Configurator() {
    console.count('Компонент Configurator перемалювався');
    const { productId = "default_id" } = useParams();
    const modelViewerRef = useRef();
    const [isModel, setModel] = useState(null);
    const [customizations, setCustomizations] = useState({});
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [activeColorOptions, setActiveColorOptions] = useState({ values: [], names: [] });
    const [textureIndex, setTextureIndex] = useState(0);
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [currentTexturePath, setCurrentTexturePath] = useState(null);
    const [shareableLink, setShareableLink] = useState("");
    const [screenshotBlob, setScreenshotBlob] = useState(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTextureLoading, setIsTextureLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        comment: "",
    });
    const [formStatus, setFormStatus] = useState({
        status: 'idle', // 'idle', 'submitting', 'success', 'error'
        message: ''
    });
    const [selectedPart, setSelectedPart] = useState("facade");

    const initialTexture = useCallback(async () => {
        const modelViewer = modelViewerRef.current;
        if (!modelViewer?.model || !isModel?.configurableParts) return;

        await modelViewer.updateComplete;

        for (const part of isModel.configurableParts) {
            const material = modelViewer.model.materials.find((m) => m.name === part.materialName);
            if (!material) continue;

            const textureCust = customizations[part.textureOptionKey];
            const colorCust = customizations[part.colorOptionKey];

            try {
                if (textureCust) {
                    const texture = await modelViewer.createTexture(textureCust.value);
                    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                    material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
                } else if (colorCust) {
                    const rgb = hexToRgb(colorCust.value);
                    material.pbrMetallicRoughness.setBaseColorFactor([...rgb, 1]);
                    material.pbrMetallicRoughness.baseColorTexture.setTexture(null);
                }
            } catch (err) {
                console.error(`Ошибка инициализации для ${part.materialName}:`, err);
            }
        }
    }, [isModel, customizations]);


    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!screenshotBlob) {
            alert("Будь ласка, зробіть скріншот перед відправкою.");
            return;
        }
        setFormStatus({ status: 'submitting', message: 'Відправка...' });
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("phone", formData.phone);
            formDataToSend.append("email", formData.email);
            formDataToSend.append("comment", formData.comment);
            formDataToSend.append("screenshot", screenshotBlob, "model-screenshot.png");
            formDataToSend.append("model", productId);
            isModel.configurableParts.forEach((part) => {
                const textureCust = customizations[part.textureOptionKey];
                const colorCust = customizations[part.colorOptionKey];

                if (textureCust) {
                    const textureName = isModel.options[part.textureOptionKey]?.values.find(v => v.path === textureCust.value)?.name || "Не обрано";
                    formDataToSend.append(`${part.key}_material`, textureName);
                    formDataToSend.append(`${part.key}_color`, 'N/A');
                } else if (colorCust) {
                    const colorConfig = isModel.options[part.colorOptionKey];
                    const colorIndex = colorConfig.values.indexOf(colorCust.value);
                    const colorName = colorIndex > -1 ? (colorConfig.colorName?.[colorIndex] || colorCust.value) : colorCust.value;
                    formDataToSend.append(`${part.key}_color`, colorName);
                    formDataToSend.append(`${part.key}_material`, 'N/A');
                }
            });
            formDataToSend.append("shareableLink", shareableLink);

            const response = await fetch("http://localhost:5051/api/submit", { method: "POST", body: formDataToSend });
            if (response.ok) {
                alert("Запит успішно надіслано!");
                setFormData({ name: "", phone: "", email: "", comment: "" });
                setScreenshotBlob(null);
                setIsModalOpen(false);
            } else { throw new Error("Помилка відправки запиту."); }
        } catch (err) {
            console.error("Помилка:", err);
            setFormStatus({ status: 'error', message: `Сталася помилка: ${err.message}. Спробуйте ще раз.` });
        }
    };

    const togglePanel = () => {
        setIsPanelCollapsed(!isPanelCollapsed);
    };

    const openModal = async () => {
        const screenshotCreated = await captureScreenshot();
        if (screenshotCreated) setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);

        setFormStatus({ status: 'idle', message: '' });
    };

    useEffect(() => {
        if (!modelViewerRef.current || !isModel) return;

        const checkModel = () => {
            if (modelViewerRef.current.model) {
                initialTexture();
                setIsModelLoaded(true);
            } else {
                setTimeout(checkModel, 200);
            }
        };
        checkModel();
    }, [isModel, initialTexture]);

    const captureScreenshot = useCallback(async () => {
        if (!modelViewerRef.current || !isModelLoaded) {
            console.warn("Модель еще не завантажена для скріншота.");
            return false;
        }
        try {
            const blob = await modelViewerRef.current.toBlob({
                idealAspect: true,
                mimeType: "image/png",
                quality: 1,
            });

            setScreenshotBlob(blob);
            console.log("Скріншот створено та збережено в стані.");
            return true;
        } catch (err) {
            console.error("Помилка створення скріншота:", err);

            return false;
        }
    }, [isModelLoaded]);

    const handleModelLoad = useCallback(() => {}, []);

    const updateShareableLink = useCallback((currentCustoms, currentProdId) => {
        const params = new URLSearchParams();
        for (const [key, config] of Object.entries(currentCustoms)) {
            if (config?.value) {
                params.set(key, config.value);
            }
        }
        const baseUrl = `${window.location.origin}/customize/${currentProdId}`;
        const newLink = `${baseUrl}?${params.toString()}`;
        window.history.pushState({}, "", newLink);
        setShareableLink(newLink);
    }, []);

    const applyTexture = useCallback(
        async (materialName, textureValue) => {
            if (!modelViewerRef.current?.model) return;
            const material = modelViewerRef.current.model.materials.find((m) => m.name === materialName);
            if (!material) return;
            try {
                await modelViewerRef.current.updateComplete;
                const texture = await modelViewerRef.current.createTexture(textureValue);
                material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
            } catch (err) {}
        }, []
    );

    const updateActiveColors = useCallback(
        (colorConfig) => {
            if (!colorConfig?.values) {
                setActiveColorOptions({ values: [], names: [] });
                return;
            }
            setActiveColorOptions({ values: colorConfig.values, names: colorConfig.colorName });
        }, []
    );

    const applyColor = useCallback(
        async (materialName, colorValue) => {
            if (!modelViewerRef.current?.model) return;
            const material = modelViewerRef.current.model.materials.find((m) => m.name === materialName);
            if (!material) return;
            try {
                await modelViewerRef.current.updateComplete;
                const rgb = hexToRgb(colorValue);
                material.pbrMetallicRoughness.setBaseColorFactor([...rgb, 1]);
                material.pbrMetallicRoughness.baseColorTexture.setTexture(null);
            } catch (err) {}
        }, []
    );

    useEffect(() => {
        setLoading(true);
        setError(null);
        const model = getModelData(productId);

        if (!model) {
            setError(`Модель з ID "${productId}" не знайдена.`);
            setLoading(false);
            return;
        }
        setModel(model);

        const initialCustomizations = {};
        const params = new URLSearchParams(window.location.search);

        model.configurableParts.forEach((part) => {
            const textureConfig = model.options[part.textureOptionKey];
            const colorConfig = model.options[part.colorOptionKey];
            const textureValueFromUrl = params.get(part.textureOptionKey);
            const colorValueFromUrl = params.get(part.colorOptionKey);

            if (textureValueFromUrl && textureConfig) {
                initialCustomizations[part.textureOptionKey] = { materialName: textureConfig.materialName, type: "texture", value: textureValueFromUrl };
            } else if (colorValueFromUrl && colorConfig) {
                initialCustomizations[part.colorOptionKey] = { materialName: colorConfig.materialName, type: "color", value: colorValueFromUrl };
            } else {
                if (textureConfig?.defaultValue) {
                    initialCustomizations[part.textureOptionKey] = { materialName: textureConfig.materialName, type: "texture", value: textureConfig.defaultValue };
                } else if (colorConfig?.defaultValue) {
                    initialCustomizations[part.colorOptionKey] = { materialName: colorConfig.materialName, type: "color", value: colorConfig.defaultValue };
                }
            }
        });

        setCustomizations(initialCustomizations);
        updateShareableLink(initialCustomizations, productId);
        setLoading(false);
    }, [productId, updateShareableLink]);


    const handleOptionChange = useCallback(
        (optionName, materialName, type, value, oppositeKey) => {
            setCustomizations((prev) => {
                const newCustoms = { ...prev };
                delete newCustoms[oppositeKey];

                if (optionName) {
                    newCustoms[optionName] = { materialName, type, value };
                    if (type === "texture") {
                        applyTexture(materialName, value);
                    } else {
                        applyColor(materialName, value);
                    }
                }

                updateShareableLink(newCustoms, productId);
                //setScreenshotBlob(null);
                return newCustoms;
            });
        },
        [applyTexture, applyColor, updateShareableLink, productId]
    );

    useEffect(() => {
        if (!isModelLoaded) return;

        const part = isModel.configurableParts.find(p => p.key === selectedPart);
        if(!part) return;

        const textureConf = isModel.options[part.textureOptionKey];
        if (textureConf) {
            const currentTexValue = customizations[part.textureOptionKey]?.value || textureConf.defaultValue;
            const texIndex = findTextureIndex(currentTexValue, textureConf);
            setTextureIndex(texIndex);
            setCurrentTexturePath(currentTexValue);
        }

        const colorConf = isModel.options[part.colorOptionKey];
        if (colorConf) {
            updateActiveColors(colorConf);
            const currentColValue = customizations[part.colorOptionKey]?.value || colorConf.defaultValue;
            const colIndex = colorConf.values.indexOf(currentColValue);
            setCurrentColorIndex(colIndex > -1 ? colIndex : 0);
        }

        setCurrentMaterial(part.materialName);
    }, [isModelLoaded, selectedPart, customizations, isModel, updateActiveColors]);

    useEffect(() => {
        console.log(`%c[СТАТУС] isModalOpen змінився на: ${isModalOpen}`, 'color: purple;');
    }, [isModalOpen]);

    const handleModelError = useCallback((event) => {
        setError("Помилка завантаження 3D моделі.");
        setLoading(false);
    }, []);

    const copyLink = () => {
        navigator.clipboard.writeText(shareableLink);
        alert("Посилання скопійовано!");
    };

    if (loading) return <div>Завантаження...</div>;
    if (error) return <div className="error-message">Помилка: {error}</div>;
    if (!isModel) return <div>Не вдалося завантажити дані моделі.</div>;

    const currentPartInfo = isModel.configurableParts.find((p) => p.key === selectedPart);
    const textureOptionKey = currentPartInfo?.textureOptionKey;
    const colorOptionKey = currentPartInfo?.colorOptionKey;

    let selectionDescription = `Елемент: ${currentPartInfo?.displayName || selectedPart}`;

    const activeTexture = textureOptionKey ? customizations[textureOptionKey] : null;
    const activeColor = colorOptionKey ? customizations[colorOptionKey] : null;

    if (activeTexture) {
        const textureConfig = isModel.options[textureOptionKey];
        const textureName = textureConfig?.values?.find(t => t.path === activeTexture.value)?.name || 'Не обрано';
        selectionDescription += `, Матеріал: ${textureName}`;
    } else if (activeColor) {
        const colorConfig = isModel.options[colorOptionKey];
        const colorIndex = colorConfig?.values?.indexOf(activeColor.value);
        const colorName = (colorIndex > -1 && colorConfig.colorName?.[colorIndex]) ? colorConfig.colorName[colorIndex] : activeColor.value;
        selectionDescription += `, Колір: ${colorName}`;
    }

    return (
        <div className="configurator-container-overlay">
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeModal}>×</button>
                        <h3>Залишити запит</h3>

                        {/* Условный рендеринг в зависимости от статуса */}
                        {formStatus.status === 'success' ? (
                            <div className="form-status-message success-message">
                                <p>{formStatus.message}</p>
                                <button onClick={closeModal} className="close-modal-btn">Закрити</button>
                            </div>
                        ) : (
                            <>
                                <div className="modal-selection-info">
                                    <p><strong>Вибрана конфігурація:</strong> {selectionDescription}</p>
                                </div>
                                <form onSubmit={handleFormSubmit} className="modal-form">
                                    <div><label>Ім'я:</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} required /></div>
                                    <div><label>Телефон:</label><input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} required /></div>
                                    <div><label>Email:</label><input type="email" name="email" value={formData.email} onChange={handleFormChange} required /></div>
                                    <div><label>Коментар:</label><textarea name="comment" value={formData.comment} onChange={handleFormChange} /></div>

                                    {/* Показываем сообщение об ошибке, если оно есть */}
                                    {formStatus.status === 'error' && (
                                        <p className="form-status-message error-message">{formStatus.message}</p>
                                    )}

                                    <button type="submit" disabled={!screenshotBlob || formStatus.status === 'submitting'}>
                                        {formStatus.status === 'submitting' ? 'Відправка...' : 'Надіслати'}
                                    </button>
                                </form>
                                <div className="copy-link">
                                    <p className="copy-link-url">
                                        <strong>Посилання:</strong>{" "}
                                        <a href={shareableLink} target="_blank" rel="noopener noreferrer">{shareableLink}</a>
                                        <button onClick={copyLink} className="copy-link-button">Копіювати</button>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div className="viewer-container-overlay">
                {!isModelLoaded && <div className="loading-overlay">Завантаження 3D моделі...</div>}
                <model-viewer
                    ref={modelViewerRef}
                    style={{ width: "100%", height: "100%" }}
                    className={`model-viewer-element ${isModelLoaded ? "loaded" : "loading"}`}
                    id="myModelViewer"
                    exposure="1.0"
                    camera-controls
                    key={isModel.path}
                    src={isModel.path}
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                    tone-mapping="neutral"
                    shadow-intensity="1"
                >
                    <div slot="progress-bar" className="progress-bar">
                        <div className="update-bar"></div>
                    </div>
                </model-viewer>
            </div>

            <div
                className={`panel-container-overlay ${!isModelLoaded ? "panel-loading" : ""} ${
                    isPanelCollapsed ? "collapsed" : ""
                }`}
            >
                <button
                    className="toggle-panel-button"
                    onClick={togglePanel}
                    disabled={!isModelLoaded}
                >
                    {isPanelCollapsed ? "▶" : "▼"}
                </button>
                <div className="selection-description">{selectionDescription}</div>
                <CustomizationPanel
                    modelOptions={isModel}
                    currentSelections={customizations}
                    onOptionChange={handleOptionChange}
                    disabled={!isModelLoaded}
                    selectedPart={selectedPart}
                    setSelectedPart={setSelectedPart}
                    setTextureIndex={setTextureIndex}
                    setCurrentTexturePath={setCurrentTexturePath}
                    setCurrentMaterial={setCurrentMaterial}
                    updateActiveColors={updateActiveColors}
                    setCurrentColorIndex={setCurrentColorIndex}
                />
                <button
                    className="submit-model-button"
                    onClick={openModal}
                    disabled={!isModelLoaded || isTextureLoading}
                >
                    Відправити модель
                </button>
            </div>


        </div>
    );
}

export default Configurator;