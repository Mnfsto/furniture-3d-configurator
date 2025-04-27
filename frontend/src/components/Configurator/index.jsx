import {useParams} from "react-router";
import CustomizationPanel from "../CustomizationPanel";
import { getModelData } from '../../config/modelsData';
import {useCallback, useEffect, useRef, useState} from "react";
import '@google/model-viewer';

import hexToRgb from "../../config/hexToRGB";

function Configurator () {
    const { productId = 'default_id' } = useParams();
    const modelViewerRef = useRef(null);
    const [isModel, setModel] = useState(null);
    const [modelPath, setModelPath] = useState(null);
    const [customizations, setCustomizations] = useState({});
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [activeColorOptions, setActiveColorOptions]  = useState({ values: [], names: [] });
    const [textureIndex, setTextureIndex] = useState(0);
    const [currentMaterial,  setCurrentMaterial] = useState(null);
    const [currentTexturePath,setCurrentTexturePath] = useState(null);
    const [shareableLink, setShareableLink] = useState('');
    const [screenshotBlob, setScreenshotBlob] = useState(null);
    const [isModelLoaded ,setIsModelLoaded]=useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



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



    const findTextureIndex = useCallback((texturePath, textureOptions) => {
        if (!textureOptions || !textureOptions.values) return 0;
        const index = textureOptions.values.findIndex(tex => tex.path === texturePath);
        return index >= 0 ? index : 0;
    }, [textureIndex]);

    const applyTexture = useCallback(async (materialName = currentMaterial, textureValue = currentTexturePath) =>{
        if (!modelViewerRef.current) return;
        console.log(textureValue);
        console.log(materialName, textureValue);
        const material =  modelViewerRef.current.model?.materials.find(m => m.name === materialName);
        try {
            await modelViewerRef.current.updateComplete;
            const textureUrl = textureValue;
            const texture = await modelViewerRef.current.createTexture(textureUrl);
            console.log(texture);
            const pbr = material.pbrMetallicRoughness;
            pbr.baseColorTexture.setTexture(texture);
            console.log(`Текстура изменена на`, textureUrl);

        }catch (err) {
            console.error('Error when applying texture:', err);
            console.log('Error when applying texture.');
        }

    },[textureIndex, customizations, currentTexturePath])

    const updateActiveColors = useCallback((textureIndex, colorConfig) => {
        if (!colorConfig || !Array.isArray(colorConfig.values) || !Array.isArray(colorConfig.values[textureIndex])) {
            console.warn("Color config is invalid or index out of bounds");
            setActiveColorOptions({ values: [], names: [] }); // Reset to empty
            return;
        }
        const values = colorConfig.values[textureIndex];
        const names = colorConfig.colorName?.[textureIndex] ?? values;
        setActiveColorOptions({ values, names });

    }, []);

    const applyColor = useCallback((materialName, colorValues) => {
        console.log(colorValues);
        if (!modelViewerRef.current) return;
    try{
        const material = modelViewerRef.current.model?.materials.find(m => m.name === materialName);
        if (material) {
            const colorRGB = hexToRgb(colorValues);
            console.log(colorRGB);
            const pbr = material.pbrMetallicRoughness;
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

    const changeColor = useCallback(() => {
        setCurrentColorIndex( currentColorIndex + 1);
        const material = customizations.color_faasade.materialName
        console.log(customizations)
        const colors = activeColorOptions.values;
        const colorRGB = colors[currentColorIndex];
        const targetMaterialName = isModel.options.color_faasade.materialName || material;
        applyColor(targetMaterialName, colorRGB);
        if(currentColorIndex === colors.length - 1)  setCurrentColorIndex(0);
        console.log(colorRGB)
    },[isModel, activeColorOptions, currentColorIndex]);


// Effect to initialize model data and customizations
    useEffect(() => {
        setLoading(true);
        setError(null);
        setIsModelLoaded(false);
        setCustomizations({});
        const model = getModelData(productId);
        if (!model){
            setError(`Модель з ID "${productId}" не знайдена.`);
            setModel(null);
            setLoading(false);
            return;
        }
        setModel(model)
        setModelPath(() => model.path);
        const initialCustomizations = {};
        const params = new URLSearchParams(window.location.search);
        let initialTextureIndex = 0;
        let initialColorValue = 0;


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
        } else {
            setTextureIndex(0);
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
            } else {
                // Fallback: Use default value IF it's in the current palette, else use the first color
                initialColorValue = currentPalette.includes(colorConfig.defaultValue)
                    ? colorConfig.defaultValue
                    : currentPalette[0] || '#FFFFFF';
            }

            initialCustomizations['color_faasade'] = {
                materialName: colorConfig.materialName,
                type: 'color',
                value: initialColorValue
            }




            setCustomizations(initialCustomizations);
            updateShareableLink(initialCustomizations, productId);
            setLoading(false);
        }


    },[productId, updateActiveColors]);

    // Update customization state and derived states (active colors)
    const handleOptionChange = useCallback((optionName, materialName, type, value) => {
        console.log(optionName, materialName, type, value)
        let newTextureIndex = textureIndex;
        let newCustomizations = { ...customizations };
        console.log(newTextureIndex, currentMaterial);
        if (optionName === "texture_faasade") {
            const textureConfig = isModel?.options[optionName];
            if (textureConfig) {
                newTextureIndex = findTextureIndex(value, textureConfig);
                setTextureIndex(newTextureIndex);
                const colorConfig = isModel.options["color_faasade"];
                setCurrentTexturePath(value);
                applyTexture(materialName, value);

                if (colorConfig) {
                    console.log(colorConfig);
                    updateActiveColors(newTextureIndex, colorConfig);
                    const newPalette = colorConfig.values[newTextureIndex] || [];
                    const newDefaultColor = newPalette[0] || '#FFFFFF';
                    newCustomizations['color_faasade'] = {
                        ...newCustomizations['color_faasade'],
                        value: newDefaultColor
                    };
                }
            }
        }

        if (optionName === "color_faasade") {
            applyColor(currentMaterial, value)
        }

        newCustomizations[optionName] = { materialName, type, value };
        setCustomizations(newCustomizations);
        updateShareableLink(newCustomizations, productId);
        setScreenshotBlob(null);

    }, [customizations, productId, isModel, textureIndex, findTextureIndex,]);

    useEffect(() => {
        const modelViewer = modelViewerRef.current;
        if(!isModelLoaded || !modelViewer?.model) {
            return;
        }
        console.log("Apply Effec: Applying customizations to model:\", customizations");

        const apply = async() => {
            try {
                await modelViewer.updateComplete;
                for(const material of modelViewer.model.materials) {
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
                        material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                        material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
                        textureApplied = true;
                        }catch(err) {
                            console.error(`Error applying texture ${textureCust.value} to ${material.name}`);
                        }

                    }
                    /////apply color
                    const colorCust = Object.values(customizations).find(
                        c => c.materialName === material.name && c.type === 'color'
                    );
                    if (colorCust?.value) {
                        //applyColor(currentMaterial, value)
                        //apply -----------
                        if (!textureApplied) {
                            try {
                                console.log(`Applying color ${colorCust.value} to ${material.name}`);
                                const colorRGB = hexToRgb(colorCust.value); // Assuming hexToRgb returns [r,g,b]
                                material.pbrMetallicRoughness.setBaseColorFactor([...colorRGB, 1]); // Add alpha
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
    },[customizations,isModelLoaded]);

    // --- Model Viewer Event Handlers ---
    const handleModelLoad = useCallback(() => {
        console.log('Model loaded event received.');
        setIsModelLoaded(true);
    }, []);

    const handleModelError = useCallback((event) => {
        console.error('Model loading error:', event.detail);
        setError('Помилка завантаження 3D моделі.');
        setLoading(false); // Stop loading indicator on error
    }, []);

    if (loading) return <div>Завантаження...</div>;
    if (error) return <div className="error-message">Помилка: {error}</div>;
    if (!isModel) return <div>Не вдалося завантажити дані моделі.</div>;

    return (
        <div>
            <button onClick={()=>changeColor()}>Change Color</button>
            <button onClick={()=>applyTexture()}>Change Texture</button>
            <CustomizationPanel
                modelOptions={isModel.options}
                currentSelections={customizations}
                onOptionChange={handleOptionChange}
                // --- NEW: Pass active color options ---
                activeColorPalette={activeColorOptions.values}
                activeColorNames={activeColorOptions.names}
            />
            <div style={{width: '100%', height: '500px', display: 'block'}}>
                <model-viewer
                    ref={modelViewerRef}
                    style={{ width: '100%', height: '100%'}}
                    id="myModelViewer"
                    key={isModel.path}
                    src={modelPath}
                    onLoad={handleModelLoad}
                    onError={handleModelError}
                    auto-rotate
                    camera-controls
                    tone-mapping="neutral"
                    poster="poster.webp"
                    shadow-intensity="1">
                </model-viewer>
            </div>
        </div>

    )
}

export default Configurator;