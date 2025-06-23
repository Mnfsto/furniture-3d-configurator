import {useCallback, useEffect, useRef, useState} from "react";
import '@google/model-viewer';
import { getModelData } from '../../config/modelsData';
import hexToRgb from "../../config/hexToRGB";


const findTextureIndex = (texturePath, textureOptions) => {
    if (!textureOptions || !textureOptions.values) return 0;
    const index = textureOptions.values.findIndex(tex => tex.path === texturePath);

    return index >= 0 ? index : 0;
};

function HomePage () {
    const modelViewerRef = useRef();
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isModel, setModel] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHide, setHide] = useState(false);
    const modelViewerSliderRef = useRef();
    const [sliderModel, setSliderModel] = useState({
        name: 'Palma',
        src: '/models/Palma.glb',
        poster: '/assets/img.png',
        description: 'Тумба Palma 80-2 з умивальником Vitold 800 торгової марки Fancy Marble.'
    });

    const initialTexture = async (viewer, materialName, initialCustomizations, textureValue, load = () => {
    }) => {
        const modelViewer = viewer;
        console.log("Initial");

        const colorValue = initialCustomizations;
        const texturePath = textureValue;

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
                const texture = await modelViewer.current.createTexture(texturePath);
                material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                material.pbrMetallicRoughness.setBaseColorFactor(hexToRgb(colorValue.defaultValue));
            } catch (err) {
                console.error("WARRRRRNING", err);
            }
        }


    }

    useEffect(() => {
        setLoading(true);
        const model = getModelData('default_id');
        setModel(model);
        console.log(model)
        const currentMaterial = model.options['texture_faasade'].materialName;
        const cusomization = model.options['color_faasade'];
        const texturePath = model.options['texture_faasade'].defaultValue;
        const colorValue = model.defaultValue;
        const animation = () => {
            console.log("hideeeeeee")
            setHide(true);
        }
        const checkModel = () => {
            if (modelViewerRef.current) {
                setIsModelLoaded(true)
                initialTexture(modelViewerRef, currentMaterial, cusomization, texturePath);
                setTimeout(animation, 5000)
            } else {
                console.log('Модель еще не загружена');
                setTimeout(checkModel, 4000);
            }
        };

        checkModel();
        setLoading(false);
        setError(null);
        return clearTimeout(animation);
    }, [isModel]);

    const handleModelError = useCallback((event) => {
        console.error('<<< Model loading FAILED! >>>', event.detail);
        console.error('Model loading error:', event.detail);
        setError('Помилка завантаження 3D моделі.');
        setLoading(false);
    }, []);

    const handleModelLoad = () => {
        console.log('Model loaded event received.');
        //initialTexture();

    }

    // Нова функція для переключення моделей у слайдері
    const switchSrc = (name) => {
        const base = `../../models/${name}`;
        setSliderModel({
            name,
            src: `${base}.glb`,
            poster: `${base}.webp`
        });
    };

    // Нова функція для кнопки "Сконфігурировать модель"
    const configureModel = () => {
        // Приклад: відкриваємо конфігуратор у новому вікні
        window.open(`/customize/${sliderModel.name.toLowerCase()}`, '_blank');
        // Альтернатива: console.log для дебагінгу
        // console.log(`Відкрити конфігуратор для моделі: ${sliderModel.name}`);
    };

    // Обробка події beforexrselect для слайдера
    useEffect(() => {
        const slider = document.querySelector('.slider');
        if (slider) {
            const preventXRSelect = (ev) => ev.preventDefault();
            slider.addEventListener('beforexrselect', preventXRSelect);
            return () => slider.removeEventListener('beforexrselect', preventXRSelect);
        }
    }, []);

    if (loading) return <div>Завантаження...</div>;
    if (error) return <div className="error-message">Помилка: {error}</div>;
    if (!isModel) return <div>Не вдалося завантажити дані моделі.</div>;
    return (
        // <HomeHeader /> можно просто удалить из App.jsx или скрыть через CSS
        <div className="wrapper wrapper-home-page">
            {/* Основной контент сразу виден */}
            <main className="homepage-main-content">

                <div className="slider-container">
                    <model-viewer
                        ref={modelViewerSliderRef}
                        src={sliderModel.src}
                        shadow-intensity="1"
                        ar
                        camera-controls
                        touch-action="pan-y"
                        alt="A 3D model carousel"
                        className="model-viewer-slider"
                        exposure="0.008"
                    >
                        <button slot="ar-button" id="ar-button">
                            View in your space
                        </button>
                        {/*<div id="ar-prompt">*/}
                        {/*    <img src="/assets/img.png" alt="AR prompt hand"/>*/}
                        {/*</div>*/}
                        <button id="ar-failure">AR is not tracking!</button>
                        <div className="slider">
                            <div className="slides">
                                {[
                                    {name: 'Palma', poster: '/assets/1_SideView.jpg'},
                                    {name: 'Burry', poster: '/assets/BARY1.jpg'},
                                    {name: 'Edge', poster: '/assets/Edgem1.jpg'},
                                    {name: 'Mill', poster: '/assets/mill1000.jpg'},
                                    {name: 'Vivara', poster: '/assets/J1250_1.jpg'}
                                ].map((model) => (
                                    <button
                                        key={model.name}
                                        className={`slide ${sliderModel.name === model.name ? 'selected' : ''}`}
                                        onClick={() => switchSrc(model.name)}
                                        style={{backgroundImage: `url(${model.poster})`}}
                                    />
                                ))}
                            </div>
                        </div>
                    </model-viewer>
                    <div className="model-info">
                        <h1>{sliderModel.name}</h1>
                        <p className="model-description">
                            {sliderModel.description || 'Опис моделі недоступний.'}
                        </p>
                        <button
                            className="configure-button"
                            onClick={configureModel}
                            aria-label={`Сконфігурувати модель ${sliderModel.name}`}
                        >
                            Сконфігурувати модель
                        </button>
                        <div className="contact-info">
                            <p><a href="tel:+380123456789">+380 123 456 789</a></p>
                            <p><a href="mailto:info@example.com">info@example.com</a></p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
export default HomePage;
