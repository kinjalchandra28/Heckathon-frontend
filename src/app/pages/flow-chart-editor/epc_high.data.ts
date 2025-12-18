import { ProgramModule } from "./models/program-module.model";

export const epc_high_data: ProgramModule[] = [
    {
        "type": 0,
        "x": 73.015625,
        "y": 420.4375,
        "name": "$500d7a5a",
        "inputs": [
            "calculated_product_temperature"
        ],
        "parameters": [
            ""
        ]
    },
    {
        "type": 1,
        "x": 372.378906,
        "y": 381.527344,
        "name": "$5c2c3d6a",
        "inputs": [
            "$500d7a5a"
        ],
        "classes": [
            "$51012609"
        ],
        "parameters": [
            "2"
        ]
    },
    {
        "type": 0,
        "x": 298.121094,
        "y": 271.542969,
        "name": "$51012609",
        "inputs": [
            "cpt_high_temperature"
        ],
        "parameters": [
            ""
        ]
    },
    {
        "type": 0,
        "x": 525.8125,
        "y": 421.335938,
        "name": "%severity",
        "inputs": [
            "$5c2c3d6a"
        ],
        "parameters": [
            ""
        ]
    }
]