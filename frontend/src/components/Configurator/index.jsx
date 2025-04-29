import {useParams} from "react-router";
import CustomizationPanel from "../CustomizationPanel";
import { getModelData } from '../../config/modelsData';
import {useCallback, useEffect, useRef, useState} from "react";
import '@google/model-viewer';

import hexToRgb from "../../config/hexToRGB";
const findTextureIndex = (texturePath, textureOptions) => {
    if (!textureOptions || !textureOptions.values) return 0;
    const index = textureOptions.values.findIndex(tex => tex.path === texturePath);
    return index >= 0 ? index : 0;
};

// const initialModel = async (viewer) => {
//     await console.log('init')
//     await viewer.updateComplete;
//     const modelViewer =  await viewer;
//     console.log('modelViewer', modelViewer);
//     if (!modelViewer?.model?.materials) {
//         console.error("Initial setup: Модель или материалы не готовы.");
//         return
//     }
//
//     return  modelViewer;
//
// };




function Configurator () {
    const {productId = 'default_id'} = useParams(null);
    const modelViewerRef = useRef();
    const [isModel, setModel] = useState(null);
    const [customizations, setCustomizations] = useState({});
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [activeColorOptions, setActiveColorOptions] = useState({values: [], names: []});
    const [textureIndex, setTextureIndex] = useState(0);
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [currentTexturePath, setCurrentTexturePath] = useState(null);
    const [shareableLink, setShareableLink] = useState('');
    const [screenshotBlob, setScreenshotBlob] = useState(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, load] = useState(true)

    console.log(textureIndex)
    console.log(customizations)
    console.log(activeColorOptions)

    const applyAllCustomizations = useCallback(async (viewer, currentCustoms) => {
        if (!viewer?.model?.materials) {
            console.error("ApplyAllCustomizations: Viewer или модель/материалы не готовы.");
            return;
        }
        if (Object.keys(currentCustoms).length === 0) {
            console.log("ApplyAllCustomizations: Нет кастомизаций для применения.");
            return;
        }

        console.log("ApplyAllCustomizations: Применение кастомизаций:", currentCustoms);

        try {
            await viewer.updateComplete; // Ждем завершения предыдущих операций

            for (const material of viewer.model.materials) {
                console.log(`--- Processing Material for Apply: ${material.name} ---`);
                if (!material.pbrMetallicRoughness) {
                    console.warn(`ApplyAllCustomizations: Material "${material.name}" skipped (no PBR).`);
                    continue;
                }
                const pbr = material.pbrMetallicRoughness;
                const baseColorTextureInfo = pbr.baseColorTexture;
                let textureApplied = false;

                // --- 1. Применяем ТЕКСТУРУ ---
                const textureCust = Object.values(currentCustoms).find(
                    // V--- ИСПРАВЛЕНО СРАВНЕНИЕ ---V
                    m => m.materialName === material.name && m.type === 'texture'
                );

                if (textureCust?.value) {
                    console.log(`ApplyAllCustomizations: Found texture for "${material.name}": ${textureCust.value}`);
                    try {
                        const textureUrl = textureCust.value;
                        // V--- ИСПРАВЛЕН ВЫЗОВ ---V
                        const texture = await viewer.createTexture(textureUrl);

                        if (texture && baseColorTextureInfo) {
                            // 1. Устанавливаем текстуру
                            baseColorTextureInfo.setTexture(texture);
                            console.log(`ApplyAllCustomizations: Texture set for "${material.name}". Waiting updateComplete...`);
                            // 2. ЖДЕМ обновления ПОСЛЕ установки текстуры
                            await viewer.updateComplete;
                            console.log(`ApplyAllCustomizations: Update complete. Getting sampler for "${material.name}"...`);
                            // 3. Получаем и настраиваем Sampler
                            const sampler = baseColorTextureInfo.sampler;
                            if (sampler) {
                                console.log(`ApplyAllCustomizations: Sampler found. Setting clamp/scale for "${material.name}".`);
                                // V--- ИСПРАВЛЕН ДОСТУП И API ---V
                                sampler.setScale(null);
                                sampler.setWrapS('clamp-to-edge');
                                sampler.setWrapT('clamp-to-edge');
                            } else {
                                console.error(`ApplyAllCustomizations: Sampler NOT FOUND for "${material.name}" after setTexture + updateComplete.`);
                            }
                            pbr.setBaseColorFactor([1, 1, 1, 1]); // Сброс цвета
                            textureApplied = true;
                            console.log(`ApplyAllCustomizations: Texture applied successfully to "${material.name}".`);
                        } else {
                            console.error(`ApplyAllCustomizations: Failed to create texture OR baseColorTextureInfo missing for "${material.name}".`);
                            if (baseColorTextureInfo) baseColorTextureInfo.setTexture(null);
                        }
                    } catch (err) {
                        console.error(`ApplyAllCustomizations: Error applying texture "${textureCust.value}" to "${material.name}":`, err);
                        if (baseColorTextureInfo) baseColorTextureInfo.setTexture(null);
                    }
                } else {
                    // Если текстуры нет в кастомизациях, очищаем существующую
                    if (baseColorTextureInfo) {
                        console.log(`ApplyAllCustomizations: No texture customization for "${material.name}". Clearing texture.`);
                        baseColorTextureInfo.setTexture(null);
                    }
                }

                // --- 2. Применяем ЦВЕТ (только если текстура НЕ применялась) ---
                if (!textureApplied) {
                    const colorCust = Object.values(currentCustoms).find(
                        c => c.materialName === material.name && c.type === 'color'
                    );
                    if (colorCust?.value) {
                        console.log(`ApplyAllCustomizations: Found color for "${material.name}": ${colorCust.value}`);
                        try {
                            const colorRGB = hexToRgb(colorCust.value);
                            if (colorRGB && colorRGB.length === 3) {
                                pbr.setBaseColorFactor([...colorRGB, 1]);
                                console.log(`ApplyAllCustomizations: Color ${JSON.stringify(colorRGB)} applied to "${material.name}".`);
                            } else { console.error(`ApplyAllCustomizations: Invalid RGB for "${colorCust.value}"`); }
                        } catch (colorError) { console.error(`ApplyAllCustomizations: Error applying color "${colorCust.value}" to "${material.name}":`, colorError); }
                    } else {
                        console.log(`ApplyAllCustomizations: No color customization for "${material.name}" (and no texture).`);
                        // Опционально: установить цвет по умолчанию, если нет ни текстуры, ни цвета
                        // pbr.setBaseColorFactor([0.8, 0.8, 0.8, 1]);
                    }
                }
                console.log(`--- ApplyAllCustomizations: Finished Material: ${material.name} ---`);
            } // Конец цикла for
        } catch (err) {
            console.error("ApplyAllCustomizations: Critical error during apply loop:", err);
        }
        //console.log("ApplyAllCustomizations: Finished applying all.");
    }, []); // useCallback с пустым массивом, т.к. внешние зависимости передаются как аргументы
    const initialTexture =  (materialName = currentMaterial, initialCustomizations = customizations, textureValue = currentTexturePath , viewer = modelViewerRef, load) =>{
        const modelViewer = viewer;
        console.log(modelViewer)
        console.log(textureValue);
        try {
            applyAllCustomizations(modelViewer, customizations);
               const ldd = viewer.materials.getMaterialByName(currentMaterial)
                //const ldd = viewer.materials.ensureLoaded()
                console.log(modelViewer.current)
                console.log(ldd)
                if(viewer?.model) console.log('modelViewer', modelViewer);
                console.log('Dont load ModelViewer!!!',isLoading)
                if(!modelViewer)return () => load(false)

        // const material = await viewer.current.model?.materials.find(m => m.name === materialName);
        // const texture = await viewer.createTexture(textureValue);
        // material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        // material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
        }catch (err){
            console.error("WARRRRRNING",err);
        }
    }

    function Handle({ load }) {
        useEffect(() => {
            load(true)
            return () => load(false)
        }, [])
    }

    const updateShareableLink = useCallback((currentCustoms, currentProdId) => {
        const params = new URLSearchParams();
        for (const [key, config] of Object.entries(currentCustoms)) {

            if (config?.value) {
                params.set(key, config.value);
            }
        }
        const baseUrl = `${window.location.origin}/customize/${currentProdId}`;
        const newLink = `${baseUrl}?${params.toString()}`;
        console.log("Updating link:", newLink);
        setShareableLink(newLink);
    }, [])





    // const applyTexture = useCallback(async (materialName = currentMaterial, textureValue = currentTexturePath) =>{
    //     if (!modelViewerRef.current) return;
    //     console.log(textureValue);
    //     console.log(materialName);
    //     const material =  await modelViewerRef.current.model?.materials.find(m => m.name === materialName);
    //     try {
    //         await modelViewerRef.current.updateComplete;
    //         const textureUrl = textureValue;
    //         const texture = await modelViewerRef.current.createTexture(textureUrl);
    //         console.log(texture);
    //         const pbr = material.pbrMetallicRoughness;
    //         pbr.baseColorTexture.setTexture(texture);
    //         console.log(`Текстура изменена на`, textureUrl);
    //
    //
    //     }catch (err) {
    //         console.error('Error when applying texture:', err);
    //         console.log('Error when applying texture.');
    //     }
    //
    // },[textureIndex, customizations, currentTexturePath])

    const updateActiveColors = useCallback((textureIndex, colorConfig) => {
        if (!colorConfig || !Array.isArray(colorConfig.values) || !Array.isArray(colorConfig.values[textureIndex])) {
            console.warn("Color config is invalid or index out of bounds");
            setActiveColorOptions({ values: [], names: [] });
            return;
        }
        const values = colorConfig.values[textureIndex];
        const names = colorConfig.colorName?.[textureIndex] ?? values;
        setActiveColorOptions({ values, names });
        setIsModelLoaded(true);
    }, []);

    // const applyColor = useCallback(async (materialName, colorValues) => {
    //     //console.log(colorValues);
    //     if (!modelViewerRef.current) return;
    // try{
    //     const material = await modelViewerRef.current.model?.materials.find(m => m.name === materialName);
    //     if (material) {
    //         const colorRGB = hexToRgb(colorValues);
    //         console.log(colorRGB);
    //         const pbr = await material.pbrMetallicRoughness;
    //         pbr.setBaseColorFactor([...colorRGB, 1]);
    //         console.log(`Цвет материала '${materialName}' изменен на`, colorValues);
    //     } else {
    //         console.warn(`Материал с именем '${materialName}' не найден в модели.`);
    //     }
    //
    // } catch (err) {
    //     console.error('Error when applying color:', err);
    //     console.log('Error when applying color.');
    // }
    // },[customizations,isModel,activeColorOptions])

    // const changeColor = useCallback(() => {
    //     setCurrentColorIndex( currentColorIndex + 1);
    //     const material = customizations.color_faasade.materialName
    //     console.log(customizations)
    //     const colors = activeColorOptions.values;
    //     const colorRGB = colors[currentColorIndex];
    //     const targetMaterialName = isModel.options.color_faasade.materialName || material;
    //     applyColor(targetMaterialName, colorRGB);
    //     if(currentColorIndex === colors.length - 1)  setCurrentColorIndex(0);
    //     console.log(colorRGB)
    // },[isModel, activeColorOptions, currentColorIndex]);


// Effect to initialize model data and customizations
    useEffect( () => {
        //console.log(`Effect: Loading data for productId: ${productId}`);
        const model = getModelData(productId);
        setModel(model);
        const modelViewer = modelViewerRef.current;
        setLoading(true);
        setError(null);

        console.log(model)
        if (!model){
            console.error(`Model data not found for ID: ${productId}`);
            setError(`Модель з ID "${productId}" не знайдена.`);
            return;
        }
        const initialCustomizations = {};
        const params = new URLSearchParams(window.location.search);
        let initialTextureIndex = 0;
        let initialColorValue = 0;
        console.log(params)

        // Process texture first to determine the color palette
        const textureConfig = model.options?.['texture_faasade'];
        let currentTexturePath = textureConfig?.defaultValue;
        if (textureConfig) {
            const textureValueFromUrl = params.get('texture_faasade')
            const isValidUrlTexture = textureConfig.values.some(v => v.path === textureValueFromUrl);
            const initialTexturePath = isValidUrlTexture ? textureValueFromUrl:currentTexturePath;
            console.log(initialTexturePath)
            initialTextureIndex = findTextureIndex(initialTexturePath, textureConfig);
            setCurrentTexturePath(initialTexturePath);
            setCurrentMaterial(textureConfig.materialName)

            initialCustomizations['texture_faasade'] = {
                materialName: textureConfig.materialName,
                type: 'texture',
                value: initialTexturePath
            };

            console.log(initialTexturePath);
            console.log(modelViewer)


        } else {
            console.log("Texture config not found.");
        }

        // Process color, using the determined texture index
        const colorConfig = model.options['color_faasade'];
        if (colorConfig) {
            // Update the active color palette based on the initial texture index
            updateActiveColors(initialTextureIndex, colorConfig);
            const colorValueFromUrl = params.get('color_faasade');
            const currentPalette = colorConfig.values[initialTextureIndex] || [];
            if (colorValueFromUrl && currentPalette.includes(colorValueFromUrl)) {
                initialColorValue = colorValueFromUrl;
                console.log(`Using color from URL: ${initialColorValue}`);
            } else {

                initialColorValue = currentPalette.includes(colorConfig.defaultValue)
                    ? colorConfig.defaultValue
                    : currentPalette[0] || '#FFFFFF';
            }

            initialCustomizations['color_faasade'] = {
                materialName: colorConfig.materialName,
                type: 'color',
                value: initialColorValue
            }


        }else {
            console.log("Color config not found.");
        };

            //applyColor(colorConfig.materialName, colorConfig.defaultValue)


            setCustomizations(initialCustomizations);
            updateShareableLink(initialCustomizations, productId);
            setLoading(false);

    },[updateActiveColors, updateShareableLink, productId]);

    // Update customization state and derived states (active colors)
    const handleOptionChange = useCallback((optionName, materialName, type, value) => {
        console.log(optionName, materialName, type, value)
        setCustomizations(prevCustoms => {
            const newCustoms = { ...prevCustoms };
            let newTextureIndex = textureIndex;
            if (optionName === 'texture_faasade') {
                const textureConfig = isModel?.options?.['texture_faasade'];
                if (textureConfig) {
                    newTextureIndex = findTextureIndex(value, textureConfig);
                    setTextureIndex(newTextureIndex);
                    const colorConfig = isModel?.options?.['color_faasade'];
                    if (colorConfig) {
                        updateActiveColors(newTextureIndex, colorConfig);
                        const newPalette = colorConfig.values?.[newTextureIndex] ?? [];
                        const newDefaultColor = newPalette[0] ?? '#FFFFFF';
                        if (newCustoms['color_faasade']) {
                            newCustoms['color_faasade'] = { ...newCustoms['color_faasade'], value: newDefaultColor };
                        }
                    }
                }
            }


            newCustoms[optionName] = { materialName, type, value };
            updateShareableLink(newCustoms, productId);
            setScreenshotBlob(null);
            return newCustoms;
        });

    }, [updateActiveColors,textureIndex ,isModel?.options, productId, updateShareableLink]);

    useEffect(() => {
        const modelViewer =  modelViewerRef.current;
        console.log(modelViewer)
        if (!isModelLoaded || !modelViewer?.model || Object.keys(customizations).length === 0){
            console.log(`Apply effect skipped: isModelLoaded=${isModelLoaded}, hasModel=${!!modelViewer?.model}, hasCustomizations=${Object.keys(customizations).length > 0}`);
            setIsModelLoaded(false);
            return;
        }
        console.log("Apply Effec: Applying customizations to model:\", customizations");

        const apply = async() => {

            console.log(modelViewer);

            try {
                await modelViewer.updateComplete;
                for(const material of  modelViewer.model.materials) {
                    let textureApplied = false;
                    console.log(shareableLink)
                    console.log("Initialize all materials elements", material.name);
                    console.log(material.name);
                    //apply ----------- materialName = currentMaterial, textureValue = currentTexturePath
                    const textureCust = Object.values(customizations).find(
                        m => m.materialName === material.name && m.type === 'texture');
                    console.log(textureCust);
                    if (textureCust?.value) {
                        try{
                        console.log(`Applying texture ${textureCust.value} to ${material.name}`);
                            console.log(textureCust.value);
                            const texture = await modelViewer.createTexture(textureCust.value);
                            await modelViewer.updateComplete;
                            material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                            material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
                            //console.log(material.clearcoatNormalScale)
                        //material.setClearcoatNormalScale(0)
                            //console.log(material.pbrMetallicRoughness)
                            //console.log(material.pbrMetallicRoughness.baseColorTexture)
                            // material.pbrMetallicRoughness.texture.Sampler

                            //material.pbrMetallicRoughness.baseColorTexture.texture.sampler.setScale(null)
                            //material.pbrMetallicRoughness.baseColorTexture.texture.sampler.setWrapS('clamp-to-edge')
                            //material.pbrMetallicRoughness.baseColorTexture.texture.sampler.setWrapT('clamp-to-edge')
                            //console.log(material.pbrMetallicRoughness.baseColorTexture.texture.sampler);

                            //material.normalTexture.texture.sampler.setWrapT(1005)
                            //material.normalTexture.texture.sampler.setWrapS(1005)
                            //console.log(material.normalTexture.texture.sampler);


                        textureApplied = true;
                        }catch(err) {
                            console.error(`Error applying texture ${textureCust.value} to ${material.name}`);
                        }

                    }else { // Если текстура НЕ задана в customizations
                        if (material.pbrMetallicRoughness.baseColorTexture.texture) {
                            material.pbrMetallicRoughness.baseColorTexture.setTexture(null); // Очищаем текстуру
                        }
                    }
                    /////apply color
                    const colorCust = Object.values(customizations).find(
                        c => c.materialName === material.name && c.type === 'color'
                    );

                    console.log(' /////apply color', colorCust?.value)
                    if (colorCust?.value) {
                        //applyColor(currentMaterial, value)
                        //apply -----------
                        if (colorCust?.value) {
                            try {
                                console.log(`Applying color ${colorCust.value} to ${material.name}`);
                                const colorRGB = hexToRgb(colorCust.value);
                                material.pbrMetallicRoughness.setBaseColorFactor([...colorRGB, 1]);
                            } catch (colorError) {
                                console.error(`Error applying color ${colorCust.value} to ${material.name} colorError`);

                            }
                        }else {
                            console.log(`Skipping color application for ${material.name} as texture was applied.`);
                        }
                    }
                }
            }catch(err) {
                console.log(err);
            };


        };
        apply();
    },[isModelLoaded, customizations, textureIndex, shareableLink]);


    useEffect(() => {
        const viewer = modelViewerRef.current;
        // Применяем, только если модель УЖЕ была загружена И есть кастомизации
        if (isModelLoaded && viewer && Object.keys(customizations).length > 0) {
            console.log("Re-apply Effect: Customizations changed, model is loaded. Re-applying...");
            applyAllCustomizations(viewer, customizations);
        } else {
            console.log("Re-apply Effect: Skipped (model not loaded yet or no customizations).");
        }
    }, [customizations, isModelLoaded, applyAllCustomizations]);

    // --- Model Viewer Event Handlers ---
    const handleModelLoad = () => {
        console.log('Model loaded event received.');
        applyAllCustomizations(modelViewerRef, customizations);
            //initialTexture();
            setIsModelLoaded(true);

    }

    const handleModelError = useCallback((event) => {
        console.error('<<< Model loading FAILED! >>>', event.detail);
        console.error('Model loading error:', event.detail);
        setError('Помилка завантаження 3D моделі.');
        setLoading(false);
    }, []);

    if (loading) return <div>Завантаження...</div>;
    if (error) return <div className="error-message">Помилка: {error}</div>;
    if (!isModel) return <div>Не вдалося завантажити дані моделі.</div>;

    return (
        <div>
            {/*<button onClick={()=>changeColor()}>Change Color</button>*/}
            {/*<button onClick={()=>applyTexture()}>Change Texture</button>*/}
            <CustomizationPanel
                modelOptions={isModel.options}
                currentSelections={customizations}
                onOptionChange={handleOptionChange}
                activeColorPalette={activeColorOptions.values}
                activeColorNames={activeColorOptions.names}
            />
            <div style={{width: '100%', height: '500px', display: 'block'}}>
                <model-viewer
                    ref={(ref) => {
                        modelViewerRef.current = ref;
                    }}

                    style={{ width: '100%', height: '100%'}}
                    id="myModelViewer"
                    exposure="0.008"
                    camera-controls
                    key={isModel.path}
                    src={isModel.path}
                    slot="progress-bar"
                    fallback = {initialTexture(load)}
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                    tone-mapping="neutral"
                    shadow-intensity="1">
                </model-viewer>
            </div>
        </div>

    )
}

export default Configurator;