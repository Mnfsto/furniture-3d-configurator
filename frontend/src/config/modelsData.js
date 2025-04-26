
//Матеріал шафи:
//МДФ
//Шпон
//ДСП

// Функция-обертка для кнопок Колір
// білий глянсoвий
// білий матовий
// графіт матовий


// Матеріал
// ДСП
// МДФ
//
// Колір
// Білий
// Антрацит
// білий глянсoвий
// білий матовий
// графіт матовий

export const modelsConfig = {
    'default_id':{
        name: "Suspended_cabinet",
        path: "/models/1.glb",
        options: {
            "color_faasade": {
                type: "color",
                materialName: "WhiteFaasade",
                defaultValue: "white",
                values: ['#ffb000', '#d40000', '#00ff77', '#6c2d2d']
            },
            'texture_faasade': {
                type: 'texture',
                materialName: 'TableTopMaterial',
                defaultValue: '/models/textures/paper-txtr.jpg',
                values: [
                    { name: 'Світле Дерево', path: '/models/textures/wood_light.jpg' },
                    { name: 'Темний Мармур', path: '/models/textures/marble_dark.jpg' }
                ]
            }
        }
    },
    'fiji-80-2-Б-An_id':{
        name: "Suspended_cabinet",
        path: "/models/1_3.glb",
        options: {
            "color_faasade": {
                type: "color",
                materialName: "WhiteFaasade.001",
                defaultValue: "white",
                values: ['#ffb000', '#d40000', '#00ff77', '#6c2d2d']
            },
            'texture_faasade': {
                type: 'texture',
                materialName: 'TableTopMaterial',
                defaultValue: '/models/textures/paper-txtr.jpg',
                values: [
                    { name: 'Світле Дерево', path: '/models/textures/wood_light.jpg' },
                    { name: 'Темний Мармур', path: '/models/textures/marble_dark.jpg' }
                ]
            }
        }
    },



}

export const getModelData = (modelId = 'default_id') => {
    return modelsConfig[modelId] || modelsConfig['default_id'];
};