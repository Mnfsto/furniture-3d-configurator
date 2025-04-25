import '@google/model-viewer';
import CustomizationPanel from "../CustomizationPanel";

 function HomePage () {


    return (
        <div>
        <CustomizationPanel/>
            <div style={{width: '600px', height: '400px'}}>
            <model-viewer
                style={{ width: '100%', height: '100%'}}
                id="myModelViewer"
                src={'models/1_3.glb'}
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