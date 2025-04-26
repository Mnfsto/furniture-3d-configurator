import { useEffect, useRef } from "react";
import '@google/model-viewer';
import CustomizationPanel from "../CustomizationPanel";
import { getModelData } from '../../config/modelsData';

 function HomePage () {
        const modleViewer = useRef()
        const model = getModelData('default_id');
        const path = model.path;
        console.log(path)

         useEffect(() => {
             console.log(getModelData('default_id'));
             console.log(modleViewer.current)
         },[]);



    return (
        <div>
            <button >Change Color</button>
        <CustomizationPanel/>
            <div style={{width: '100%', height: '500px', display: 'block'}}>
            <model-viewer
                ref={modleViewer}
                style={{ width: '100%', height: '100%'}}
                id="myModelViewer"
                src={path}
                ar ar-modes="webxr scene-viewer quick-look"
                camera-controls
                tone-mapping="neutral"
                poster="poster.webp"
                shadow-intensity="1">
                </model-viewer>
            </div>
        </div>
    );
};

 export default HomePage;