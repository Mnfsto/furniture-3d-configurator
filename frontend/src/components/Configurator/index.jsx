import {useParams} from "react-router";
import CustomizationPanel from "../CustomizationPanel";
import { getModelData } from '../../config/modelsData';
import {useCallback, useEffect, useRef, useState} from "react";
import '@google/model-viewer';
import { experimental_useEffectEvent as useEffectEvent } from 'react';

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

    let connectedCallback;
    let timeout;

    const initialTexture =   async (viewer = modelViewerRef, materialName = currentMaterial, initialCustomizations = customizations, textureValue = currentTexturePath, load = () => {}) =>{
        const modelViewer = viewer;
        console.log("Initial");
        const params = new URLSearchParams(window.location.search);
        console.log("params", params);
        const textureValueFromUrl = params.get('texture_faasade');
        const colorValueFromUrl = params.get('color_faasade');
        console.log("textureValueFromUrl", textureValueFromUrl);
        console.log("colorValueFromUrl", colorValueFromUrl);

            if (modelViewer.current) {
                

                try {
                   //const ldd = viewer.materials.getMaterialByName(currentMaterial)
                   //const ldd = viewer.materials.ensureLoaded()
                   console.log(modelViewer.current)
                   // console.log(ldd)
                   //  if(viewer?.model.model) console.log('modelViewer', modelViewer);
                   // console.log('Dont load ModelViewer!!!',isLoading)
                   //  if(!modelViewer)return () => load(false)

                    const material = modelViewer.current.model?.materials[0]
                    const texture =  await modelViewer.current.createTexture(textureValueFromUrl);
                    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);

                    if (params.size > 0){
                        const material = modelViewer.current.model?.materials[0]
                        material.pbrMetallicRoughness.setBaseColorFactor(hexToRgb(colorValueFromUrl));
                    }

                }catch (err){
                    console.error("WARRRRRNING",err);
                }
            }


    }


        // const onTexture = useEffectEvent(modelViewerRef => {
        //
        // });


        useEffect(() => {
            const modelViewer = modelViewerRef.current;


            const checkModel = () => {
                if (modelViewerRef.current) {
                    console.log(currentMaterial);
                    console.log(currentTexturePath);

                    setIsModelLoaded(true)
                    //applyTexture(currentMaterial,currentTexturePath)
                    initialTexture()



                } else {
                    console.log('Модель еще не загружена');
                    setTimeout(checkModel, 4000); // Проверяем каждые 100 мс
                }
            };

            checkModel();

        }, [isModel]);

    const handleModelLoad = useCallback(() => {
        console.log(">>> Модель ЗАГРУЖЕНА (onLoad) <<<");
        const viewer = modelViewerRef.current;
        // const timerId = setTimeout(() => {
        //     console.log("Таймер сработал, ПЫТАЕМСЯ применить кастомизации...");
        //     const viewer = modelViewerRef.current;
        //     if (viewer?.model?.materials) {
        //         console.log("Модель вроде бы доступна, применяем...");
        //
        //         setTimeout(() => {
        //             console.log('Applying customizations after 100ms delay...');
        //             if (modelViewerRef.current) { // Перепроверяем ref
        //                 applyTexture()
        //             }
        //         }, 5900); // Задержка 100 мс
        //
        //     } else {
        //         console.error("Таймер сработал, но модель все еще не готова!");
        //
        //     }
        // }, 200);
        if (viewer) {


            //return () => clearTimeout(timerId);

            setIsModelLoaded(true); // Вот теперь модель точно готова
            //initialTexture(); // Применяем НАЧАЛЬНЫЕ кастомизации
        }
    }, [customizations]);


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





    const applyTexture = useCallback(async (materialName = currentMaterial, textureValue = currentTexturePath) =>{
        if (!modelViewerRef.current.model) return;
        console.log(textureValue);
        console.log(materialName);
        const material =  await modelViewerRef.current.model?.materials.find(m => m.name === materialName);
        try {
            console.log(textureValue);
            await modelViewerRef.current.updateComplete;
            const texture = await modelViewerRef.current.createTexture(textureValue);
            await modelViewerRef.current.updateComplete;
            material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);

            console.log(`Текстура изменена на`, textureValue);


        }catch (err) {
            console.error('Error when applying texture:', err);
            console.log('Error when applying texture.');
        }

    },[textureIndex, customizations, currentTexturePath])

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

    const applyColor = useCallback(async (materialName, colorValues) => {
        //console.log(colorValues);
        if (!modelViewerRef.current) return;
    try{
        const material = await modelViewerRef.current.model?.materials.find(m => m.name === materialName);
        if (material) {
            const colorRGB = hexToRgb(colorValues);
            console.log(colorRGB);
            const pbr = await material.pbrMetallicRoughness;
            pbr.setBaseColorFactor([...colorRGB, 1]);
            console.log(`Цвет материала '${materialName}' изменен на`, colorValues);
        } else {
            console.warn(`Материал с именем '${materialName}' не найден в модели.`);
        }

    } catch (err) {
        console.error('Error when applying color:', err);
        console.log('Error when applying color.');
    }
    },[customizations,isModel,activeColorOptions])

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
        const textureConfig = model.options['texture_faasade'];
        let currentTexturePath = textureConfig?.defaultValue;

        if (textureConfig) {
            const textureValueFromUrl = params.get('texture_faasade')
            const isValidUrlTexture = textureConfig.values.some(v => v.path === textureValueFromUrl);
            const initialTexturePath = isValidUrlTexture ? textureValueFromUrl:currentTexturePath;
            console.log(initialTexturePath)
            initialTextureIndex = findTextureIndex(initialTexturePath, textureConfig);
            setCurrentTexturePath(initialTexturePath);
            setCurrentMaterial(textureConfig.materialName)
             console.log(textureConfig.materialName);
            initialCustomizations['texture_faasade'] = {
                materialName: textureConfig.materialName,
                type: 'texture',
                value: initialTexturePath
            };
            console.log(initialTextureIndex)
            console.log(initialTexturePath);
            // console.log(modelViewer)


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

    },[updateActiveColors, updateShareableLink, productId, isModel]);

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
            };


            newCustoms[optionName] = { materialName, type, value };
            updateShareableLink(newCustoms, productId);
            setScreenshotBlob(null);
            return newCustoms;
        });

    }, [isModel?.options, productId, updateShareableLink]);

    useEffect(() => {
        const modelViewer =  modelViewerRef.current;
        console.log(modelViewer)
        if (!isModelLoaded ||  !modelViewer.model || Object.keys(customizations).length === 0){
            console.log(`Apply effect skipped: isModelLoaded=${isModelLoaded}, hasModel=${!!modelViewer?.model}, hasCustomizations=${Object.keys(customizations).length > 0}`);

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
    },[isModelLoaded, customizations, textureIndex, shareableLink ]);

    // --- Model Viewer Event Handlers ---
    // const handleModelLoad = () => {
    //     console.log('Model loaded event received.');
    //
    //         //initialTexture();
    //         setIsModelLoaded(true);
    //
    // }

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
        <div className="configurator-container-overlay">

            {/* Контейнер для Model Viewer (занимает все место) */}
            <div className="viewer-container-overlay">
                {/* Оверлей загрузки */}
                {!isModelLoaded && (
                    <div className="loading-overlay">
                        Завантаження 3D моделі...
                    </div>
                )}
                <model-viewer
                    ref={(ref) => {
                        modelViewerRef.current = ref;
                    }}

                    style={{ width: '100%', height: '100%'}}
                    className={`model-viewer-element ${isModelLoaded ? 'loaded' : 'loading'}`}
                    id="myModelViewer"
                    exposure="0.008"
                    camera-controls
                    key={isModel.path}
                    src={isModel.path}
                    slot="progress-bar"
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                    tone-mapping="neutral"
                    shadow-intensity="1">
                    {/* Можно использовать стандартный прогресс-бар model-viewer */}
                    <div slot="progress-bar" className="progress-bar">
                        <div className="update-bar"></div>
                    </div>
                </model-viewer>
            </div>

            {/* Контейнер для панели кастомизации (позиционируется абсолютно) */}
            {/* Рендерим панель, только если конфиг загружен,
                 а ее активность зависит от isModelLoaded через проп disabled */}
            <div className={`panel-container-overlay ${!isModelLoaded ? 'panel-loading' : ''}`}>
                <CustomizationPanel
                    modelOptions={isModel.options}
                    currentSelections={customizations}
                    onOptionChange={handleOptionChange}
                    activeColorPalette={activeColorOptions.values}
                    activeColorNames={activeColorOptions.names}
                    disabled={!isModelLoaded}
                />
            </div>

        </div>
    );
}

export default Configurator;

