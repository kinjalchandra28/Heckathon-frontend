import { ProgramModule } from "./models/program-module.model";

export const refrigeration_data: ProgramModule[] = [
    {
        "type": 0,
        "x": 33.609375,
        "y": 415.460938,
        "name": "$6ae19b32",
        "inputs": [
            "air_off_temperature"
        ],
        "parameters": [
            ""
        ]
    },
    {
        "type": 18,
        "x": 558.09375,
        "y": 401.371094,
        "name": "$01942670",
        "inputs": [
            "$049fd132"
        ],
        "parameters": [
            "",
            "12:00:00",
            "",
            "",
            "",
            "01:00:00",
            ""
        ]
    },
    {
        "type": 0,
        "x": 724.304565,
        "y": 437.916931,
        "name": "%severity",
        "inputs": [
            "$01942670"
        ],
        "parameters": [
            ""
        ]
    },
    {
        "type": 19,
        "x": 344.003906,
        "y": 402.15625,
        "name": "$049fd132",
        "inputs": [
            "$7239f7e4",
            "$6ae19b32"
        ],
        "parameters": [
        ]
    },
    {
        "type": 0,
        "x": 35.210938,
        "y": 466.714844,
        "name": "$7239f7e4",
        "inputs": [
            "%clock"
        ],
        "parameters": [
            ""
        ]
    },
    {
        "type": 0,
        "x": 550.195312,
        "y": 317.996094,
        "name": "no_data_period",
        "inputs": [
            "$049fd132",
            "$049fd132"
        ],
        "parameters": [
            ""
        ]
    }
]