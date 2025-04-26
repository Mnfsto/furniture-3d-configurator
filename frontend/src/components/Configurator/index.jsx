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
    const [currentColorIndex, setCurrentColorIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);




    const applyTexture = async () =>{
        if (!modelViewerRef.current) return;
        const material = modelViewerRef.current.model?.materials.find(m => m.name === "WhiteFaasade");
        try {
            await modelViewerRef.current.updateComplete;
            const textureUrl ='/models/textures/paper-txtr.jpg'
            const texture = await modelViewerRef.current.createTexture(textureUrl);
            console.log(texture);
            const pbr = material.pbrMetallicRoughness;
            pbr.baseColorTexture.setTexture(texture);
            console.log(`Текстура изменена на`, textureUrl);

        }catch (err) {
            console.error('Error when applying texture:', err);
            console.log('Error when applying texture.');
        }

    };

    const applyColor = (materialName, colorValues) => {
        if (!modelViewerRef.current) return;
    try{
        const material = modelViewerRef.current.model?.materials.find(m => m.name === materialName);
        if (material) {
            const pbr = material.pbrMetallicRoughness;
            pbr.setBaseColorFactor([...colorValues, 1]);
            console.log(`Цвет материала '${materialName}' изменен на`, colorValues);
        } else {
            console.warn(`Материал с именем '${materialName}' не найден в модели.`);
        }

    } catch (err) {
        console.err('Error when applying color:', err);
        console.log('Error when applying color.');
    }
    };

    const changeColor = useCallback(() => {
        setCurrentColorIndex( currentColorIndex + 1);
        const colors = isModel.options.color_faasade.values;
        const colorRGB = hexToRgb(currentColorIndex === colors.length? colors[0]: colors[currentColorIndex]);
        const targetMaterialName = isModel.options.color_faasade.materialName;
        applyColor(targetMaterialName, colorRGB);
        if(currentColorIndex === colors.length - 1)  setCurrentColorIndex(0);
        console.log(colorRGB)
    },[isModel, currentColorIndex]);


// Effect to initialize model data and customizations
    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        setError(null);
        const model = getModelData(productId);
        setModel(() => model)
        console.log(model)
        setModelPath(() => model.path);
        };
        fetchData()
    },[]);



    return (
        <div>
            <button onClick={()=>changeColor()}>Change Color</button>
            <button onClick={()=>applyTexture()}>Change Texture</button>
            <CustomizationPanel/>
            <div style={{width: '100%', height: '500px', display: 'block'}}>
                <model-viewer
                    ref={modelViewerRef}
                    style={{ width: '100%', height: '100%'}}
                    id="myModelViewer"
                    src={modelPath}
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