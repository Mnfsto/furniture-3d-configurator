export const modelsConfig = {
    default_id: {
        name: "Suspended_cabinet",
        path: "/models/1_fix_object.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_faasade",
                colorOptionKey: "color_faasade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "body",
                textureOptionKey: "texture_body",
                colorOptionKey: "color_body",
            },
        ],
        options: {
            color_faasade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#efefef",
                colorName: ["Білий", "Антрацит", "Графіт матовий"],
                values: ["#efefef", "#333333", "#4B4B4B"],
            },
            texture_faasade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "Світле Дерево",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "Темний Мармур",
                        path: "/models/textures/wood.png",
                        thumbnail: "/models/textures/wood.png",
                    },
                ],
            },
            color_body: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Сірий корпус"],
                values: ["#f0f0f0", "#cccccc"],
            },
            texture_body: {
                type: "texture",
                materialName: "body",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "ДСП Сіре",
                        path: "/models/textures/paper-txtr.jpg",
                        thumbnail: "/models/textures/paper-txtr.jpg",
                    },
                ],
            },
        },
    },
    "fiji-80-2-Б-An_id": {
        name: "Suspended_cabinet Fiji",
        path: "/models/1_3_fix_object.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_faasade",
                colorOptionKey: "color_faasade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "washbasin",
                textureOptionKey: "texture_washbasin",
                colorOptionKey: "color_washbasin",
            },
        ],
        options: {
            color_faasade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#efefef",
                colorName: ["Білий Fiji", "Антрацит Fiji", "Морський синій"],
                values: ["#efefef", "#333333", "#006994"],
            },
            texture_faasade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "Світле Дерево Fiji",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "Мармур Fiji",
                        path: "/models/textures/SM-272.jpg",
                        thumbnail: "/models/textures/SM-272.jpg",
                    },
                ],
            },
            color_washbasin: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Сірий корпус"],
                values: ["#f0f0f0", "#cccccc"],
            },
            texture_washbasin: {
                type: "texture",
                materialName: "washbasin",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    }
                ],
            },
        },
    },
    palma: {
        name: "Suspended_cabinet Palma",
        path: "/models/Palma.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_palma_facade",
                colorOptionKey: "color_palma_facade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "body",
                textureOptionKey: "texture_palma_body",
                colorOptionKey: "color_palma_body",
            },
        ],
        options: {
            color_palma_facade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#eeeeee",
                colorName: ["Білий Palma", "Антрацит Palma", "Бежевий Palma"],
                values: ["#eeeeee", "#303030", "#f5f5dc"],
            },
            texture_palma_facade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП (Palma)",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "МДФ (Palma)",
                        path: "/models/textures/SM-272.jpg",
                        thumbnail: "/models/textures/SM-272.jpg",
                    },
                ],
            },
            color_palma_body: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Чорний корпус"],
                values: ["#f0f0f0", "#222222"],
            },
            texture_palma_body: {
                type: "texture",
                materialName: "body",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    }
                ],
            },
        },
    },
    burry: {
        name: "Suspended_cabinet Burry",
        path: "/models/Burry.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_burry_facade",
                colorOptionKey: "color_burry_facade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "body",
                textureOptionKey: "texture_burry_body",
                colorOptionKey: "color_burry_body",
            },
        ],
        options: {
            color_burry_facade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#efefef",
                colorName: ["Білий Burry", "Антрацит Burry"],
                values: ["#efefef", "#333333"],
            },
            texture_burry_facade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "Дерево Burry",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "Мармур Burry",
                        path: "/models/textures/SM-272.jpg",
                        thumbnail: "/models/textures/SM-272.jpg",
                    },
                ],
            },
            color_burry_body: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Сірий корпус"],
                values: ["#f0f0f0", "#cccccc"],
            },
            texture_burry_body: {
                type: "texture",
                materialName: "body",
                defaultValue: "/models/textures/default_body.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default_body.jpg",
                        thumbnail: "/models/textures/default_body.jpg",
                    },
                ],
            },
        },
    },
    edge: {
        name: "Suspended_cabinet Edge",
        path: "/models/Edge.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_edge_facade",
                colorOptionKey: "color_edge_facade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "body",
                textureOptionKey: "texture_edge_body",
                colorOptionKey: "color_edge_body",
            },
        ],
        options: {
            color_edge_facade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#efefef",
                colorName: ["Білий Edge", "Антрацит Edge"],
                values: ["#efefef", "#333333"],
            },
            texture_edge_facade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "Дерево Edge",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "Мармур Edge",
                        path: "/models/textures/SM-272.jpg",
                        thumbnail: "/models/textures/SM-272.jpg",
                    },
                ],
            },
            color_edge_body: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Сірий корпус"],
                values: ["#f0f0f0", "#cccccc"],
            },
            texture_edge_body: {
                type: "texture",
                materialName: "body",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                ],
            },
        },
    },
    mill: {
        name: "Suspended_cabinet Mill",
        path: "/models/Mill.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_mill_facade",
                colorOptionKey: "color_mill_facade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "body",
                textureOptionKey: "texture_mill_body",
                colorOptionKey: "color_mill_body",
            },
        ],
        options: {
            color_mill_facade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#ffffff",
                colorName: ["Білий Mill", "Антрацит Mill"],
                values: ["#ffffff", "#333333"],
            },
            texture_mill_facade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "Дерево Mill",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                    {
                        name: "Мармур Mill",
                        path: "/models/textures/SM-272.jpg",
                        thumbnail: "/models/textures/SM-272.jpg",
                    },
                ],
            },
            color_mill_body: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Сірий корпус"],
                values: ["#f0f0f0", "#cccccc"],
            },
            texture_mill_body: {
                type: "texture",
                materialName: "body",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                ],
            },
        },
    },
    vivara: {
        name: "Suspended_cabinet Vivara",
        path: "/models/Vivara.glb",
        configurableParts: [
            {
                key: "facade",
                displayName: "Фасад",
                materialName: "faasade",
                textureOptionKey: "texture_vivara_facade",
                colorOptionKey: "color_vivara_facade",
            },
            {
                key: "body",
                displayName: "Корпус",
                materialName: "body",
                textureOptionKey: "texture_vivara_body",
                colorOptionKey: "color_vivara_body",
            },
        ],
        options: {
            color_vivara_facade: {
                type: "color",
                materialName: "faasade",
                defaultValue: "#efefef",
                colorName: ["Білий", "Антрацит", "Золото", "Коричневий"],
                values: ["#efefef", "#333333", "#D4AF37", "#8B4513"],
            },
            texture_vivara_facade: {
                type: "texture",
                materialName: "faasade",
                defaultValue: "/models/textures/SM-272.jpg",
                values: [
                    {
                        name: "МДФ (Vivara)",
                        path: "/models/textures/SM-272.jpg",
                        thumbnail: "/models/textures/SM-272.jpg",
                    },
                    {
                        name: "Шпон (Vivara)",
                        path: "/models/textures/SM-308.jpg",
                        thumbnail: "/models/textures/SM-308.jpg",
                    },
                ],
            },
            color_vivara_body: {
                type: "color",
                materialName: "body",
                defaultValue: "#f0f0f0",
                colorName: ["Білий корпус", "Сірий корпус"],
                values: ["#f0f0f0", "#cccccc"],
            },
            texture_vivara_body: {
                type: "texture",
                materialName: "body",
                defaultValue: "/models/textures/default.jpg",
                values: [
                    {
                        name: "ДСП Біле",
                        path: "/models/textures/default.jpg",
                        thumbnail: "/models/textures/default.jpg",
                    },
                ],
            },
        },
    },
};

export const getModelData = (modelId = "default_id") => {

    const model = modelsConfig[modelId] || modelsConfig["default_id"];
    if (model && !model.configurableParts) {
        console.warn(
            `Model ${modelId} does not have configurableParts defined. Panel might not work as expected if options are defined without parts.`
        );
    }
    return model;
};