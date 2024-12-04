import React from 'react';
import { SwaggerUI } from '../../controls/swagger-ui/swagger-ui'
import './api-access.scss';

export function ApiAccess() {

    const swaggerSpec = {
        swagger: '2.0',
        host: window.location.host,
        basePath: window.location.pathname,
        tags: [
            {
                name: 'download',
            },
            {
                name: 'metadata',
            },
            {
                name: 'participants',
            },
            {
                name: 'pca'
            },
            {
                name: 'phenotypes',
            },
            {
                name: 'ping',
            },
            {
                name: 'points',
            },
            {
                name: 'summary',
            },
            {
                name: 'variants',
            }
        ],
        paths: {
            '/api/ping': {
                get: {
                    tags: ['ping'],
                    summary: `Retrieves status of API service`,
                    description: `Returns 'true' if the service is alive.`,
                    operationId: 'getPing',
                    produces: ['application/json'],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            content: `text/plain`,
                            schema: {
                                type: 'string',
                                example: 'true'
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                }
            },
            '/api/download': {
                get: {
                    tags: ['download'],
                    summary: 'Download the original association results for a phenotype. ',
                    description: 'Allows users to download the original association results for the specified phenotype. Because results may be hosted on a different host, ensure that your client is configured to follow redirects.',
                    operationId: 'download',
                    produces: ['application/x-gzip', 'text/plain'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'Specifies the phenotype for which to download the original association results.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'get_link_only',
                            in: 'query',
                            description: 'If set, returns the download link instead of redirecting automatically to the file.',
                            required: false,
                            type: 'string',
                            enum: ['true'],
                            default: 'true'
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'a download link or a tsv.gz file',
                            content: `text/plain`,
                            schema: {
                                type: 'string',
                                example: 'true'
                            },
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/summary': {
                get: {
                    tags: ['summary'],
                    summary: `Retrieves variants for all chromosomes`,
                    description: `Retrieves variants for all chromosomes at a resolution of 400x800 bins across the entire genome and -log10(p) range. Each bin can contain multiple variants.`, 
                    operationId: 'getSummary',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value. Specifies the phenotype id for the summarized variants to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'sex',
                            in: 'query',
                            description: 'Either "all", "female", or "male". Specifies the sex for the summarized variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: ['all', 'female', 'male'],
                            value: 'female'
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "african_american", "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the summarized variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'african_american',
                                'east_asian',
                                'european',
                            ],
                            value: 'european'
                        },
                        {
                            name: 'p_value_nlog_min',
                            in: 'query',
                            description: 'A numeric value >= 0 which specifies the minimum -log10(p) of the summarized variants.',
                            required: true,
                            type: 'number',
                            minimum: 0,
                            value: 4
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'A numeric value to limit the number of records returned.',
                            type: 'integer',
                            value: 10,
                            minimum: 0
                        },
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            schema: {
                                type: 'object',
                                required: ['data', 'columns'],
                                properties: {
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/definitions/Summary'
                                        }
                                    },
                                    columns: {
                                        type: 'array',
                                        items: {
                                            type: 'string'
                                        }
                                    }
                                },
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                }
            },
            '/api/variants': {
                get: {
                    tags: ['variants'],
                    summary: 'Retrieves a list of variants by phenotype ID',
                    description: 'Retrieves a list of variants by phenotype ID.',
                    operationId: 'getVariants',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value or a list of comma-separated numbers. Specifies the phenotype id(s) for the variants to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'sex',
                            in: 'query',
                            description: 'Either "all", "female", or "male". Specifies the sex for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: ['all', 'female', 'male'],
                            value: 'female'
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "african_american", "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'african_american',
                                'east_asian',
                                'european',
                            ],
                            value: 'european'
                        },
                        {
                            name: 'chromosome',
                            in: 'query',
                            description: 'Specifies the chromosome for the variants to retrieve.',
                            // required: true,
                            type: 'string',
                            enum: Array.from({length: 22}, (_, i) => (i + 1).toString()).concat('X'),
                            value: "8"
                        },
                        {
                            name: 'columns',
                            in: 'query',
                            description: 'A comma-separated list of properties to retrieve for each variant. By default, retrieves all properties.',
                            type: 'string'
                        },
                        {
                            name: 'snp',
                            in: 'query',
                            description: 'A space/comma/newline-separated list of snps to filter by.',
                            type: 'string'
                        },
                        {
                            name: 'position',
                            in: 'query',
                            description: 'A numeric value specifying the exact position of the variant within the selected chromosome.',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'position_min',
                            in: 'query',
                            description: 'A numeric value specifying the minimum position of the variant within the selected chromosome.',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'position_max',
                            in: 'query',
                            description: 'A numeric value specifying the maximum position of the variant within the selected chromosome.',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'p_value_nlog_min',
                            in: 'query',
                            description: 'A numeric value specifying the minimum -log10(p) of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },
                        {
                            name: 'p_value_nlog_max',
                            in: 'query',
                            description: 'A numeric value specifying the maximum -log10(p) of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },      
                        {
                            name: 'p_value_min',
                            in: 'query',
                            description: 'A numeric value specifying the minimum p-value of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },
                        {
                            name: 'p_value_max',
                            in: 'query',
                            description: 'A numeric value specifying the maximum p-value of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },       
                        {
                            name: 'orderBy',
                            in: 'query',
                            description: `Any of 'id', 'snp', 'chromosome', 'position', 'p_value', or 'p_value_nlog'. Specifies the property to order variants by.`,
                            type: 'string',
                            enum: [
                                'id',
                                'snp',
                                'chromosome', 
                                'position', 
                                'p_value', 
                                'p_value_nlog'
                            ]
                        },
                        {
                            name: 'order',
                            in: 'query',
                            description: 'Either "asc" or "desc". Specifies the order in which to sort variants.',
                            type: 'string',
                            enum: ['asc', 'desc']
                        },
                        {
                            name: 'offset',
                            in: 'query',
                            description: 'A numeric value to specify the number of records to offset the variants by (used for pagination).',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'A numeric value to limit the number of variants returned (used for pagination). Capped at 1 million.',
                            type: 'integer',
                            value: 10,
                            minimum: 0,
                            maximum: 1000000
                        },
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            schema: {
                                type: 'object',
                                required: ['data', 'columns'],
                                properties: {
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/definitions/Variant'
                                        }
                                    },
                                    columns: {
                                        type: 'array',
                                        items: {
                                            type: 'string'
                                        }
                                    }
                                },
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/export-variants': {
                get: {
                    tags: ['variants'],
                    summary: 'Retrieves a CSV file of variants by phenotype ID',
                    description: 'Has same arguments as /api/variants, but returns a CSV file instead.',
                    operationId: 'getExportVariants',
                    produces: ['application/csv'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value or a list of comma-separated numbers. Specifies the phenotype id(s) for the variants to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'sex',
                            in: 'query',
                            description: 'Either "all", "female", or "male". Specifies the sex for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: ['all', 'female', 'male'],
                            value: 'female'
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "african_american", "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'african_american',
                                'east_asian',
                                'european',
                            ],
                            value: 'european'
                        },
                        {
                            name: 'chromosome',
                            in: 'query',
                            description: 'Specifies the chromosome for the variants to retrieve.',
                            // required: true,
                            type: 'string',
                            enum: Array.from({length: 22}, (_, i) => (i + 1).toString()).concat('X'),
                            value: "8"
                        },
                        {
                            name: 'columns',
                            in: 'query',
                            description: 'A comma-separated list of properties to retrieve for each variant. By default, retrieves all properties.',
                            type: 'string'
                        },
                        {
                            name: 'snp',
                            in: 'query',
                            description: 'A space/comma/newline-separated list of snps to filter by.',
                            type: 'string'
                        },
                        {
                            name: 'position',
                            in: 'query',
                            description: 'A numeric value specifying the exact position of the variant within the selected chromosome.',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'position_min',
                            in: 'query',
                            description: 'A numeric value specifying the minimum position of the variant within the selected chromosome.',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'position_max',
                            in: 'query',
                            description: 'A numeric value specifying the maximum position of the variant within the selected chromosome.',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'p_value_nlog_min',
                            in: 'query',
                            description: 'A numeric value specifying the minimum -log10(p) of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },
                        {
                            name: 'p_value_nlog_max',
                            in: 'query',
                            description: 'A numeric value specifying the maximum -log10(p) of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },      
                        {
                            name: 'p_value_min',
                            in: 'query',
                            description: 'A numeric value specifying the minimum p-value of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },
                        {
                            name: 'p_value_max',
                            in: 'query',
                            description: 'A numeric value specifying the maximum p-value of the variant within the selected chromosome.',
                            type: 'number',
                            minimum: 0
                        },       
                        {
                            name: 'orderBy',
                            in: 'query',
                            description: `Any of 'id', 'snp', 'chromosome', 'position', 'p_value', or 'p_value_nlog'. Specifies the property to order variants by.`,
                            type: 'string',
                            enum: [
                                'id',
                                'snp',
                                'chromosome', 
                                'position', 
                                'p_value', 
                                'p_value_nlog'
                            ]
                        },
                        {
                            name: 'order',
                            in: 'query',
                            description: 'Either "asc" or "desc". Specifies the order in which to sort variants.',
                            type: 'string',
                            enum: ['asc', 'desc']
                        },
                        {
                            name: 'offset',
                            in: 'query',
                            description: 'A numeric value to specify the number of records to offset the variants by (used for pagination).',
                            type: 'integer',
                            minimum: 0
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'A numeric value to limit the number of variants returned (used for pagination). Capped at 1 million.',
                            type: 'integer',
                            value: 10,
                            minimum: 0,
                            maximum: 1000000
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'a csv file',
                            schema: {
                                type: 'file'
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/points': {
                get: {
                    tags: ['points'],
                    summary: 'Retrieves a subset of variants used to draw the Q-Q plot',
                    description: 'Retrieves a subset of variants used to draw the Q-Q plot. Only the top 5,000 variants, as well as a random sampling of 15,000 less significant p-values are returned.',
                    operationId: 'getPoints',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value. Specifies the phenotype id for the summarized Q-Q points to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'sex',
                            in: 'query',
                            description: 'Either "all", "female", or "male". Specifies the sex for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: ['all', 'female', 'male'],
                            value: 'female'
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "african_american", "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'african_american',
                                'east_asian',
                                'european',
                            ],
                            value: 'european'
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'A numeric value to limit the number of records returned.',
                            type: 'integer',
                            value: 10,
                            minimum: 0
                        },                        
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/metadata': {
                get: {
                    tags: ['metadata'],
                    summary: 'Retrieves metadata about each phenotype specified',
                    description: `Retrieves metadata about each phenotype specified. The following properties are returned:
                    <ul>
                        <li>name - Internal name of the phenotype</li>
                        <li>display_name - Displayed name</li>
                        <li>sex - all, female, or male - sex for metadata entry</li>
                        <li>ancestry - african_american, east_asian, european, TBD - ancestry for metadata entry</li>
                        <li>chromosome - all, or numeric value - chromosome for metadata entry</li>
                        <li>lambda_gc - Numeric value of lambda gc</li>
                        <li>count - Number of variants in chromosome (or 'all' chromosomes)</li>
                    </ul>`,
                    operationId: 'getMetadata',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value. Specifies the phenotype id for the metadata to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'sex',
                            in: 'query',
                            description: 'Either "all", "female", or "male". Specifies the sex for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: ['all', 'female', 'male'],
                            value: 'female'
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "african_american", "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'african_american',
                                'east_asian',
                                'european',
                            ],
                            value: 'european'
                        },
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            schema: {
                                type: 'array',
                                items: {
                                    $ref: '#/definitions/Metadata'
                                }
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/phenotypes': {
                get: {
                    tags: ['phenotypes'],
                    summary: 'Retrieves a tree of phenotypes',
                    description: 'Retrieves a tree of phenotypes. If a query is passed in (using the q parameter), returns a flat list of matching phenotypes.',
                    operationId: 'getPhenotypes',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'q',
                            in: 'query',
                            description: 'If specified, filters phenotypes by name, display name, or description and returns a flat list.',
                            type: 'string'
                        },
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            schema: {
                                type: 'array',
                                items: {
                                    $ref: '#/definitions/Phenotypes'
                                }
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/participants': {
                get: {
                    tags: ['participants'],
                    summary: `Retrieves single phenotype's aggregated participant data`,
                    description: `Retrieves single phenotype's aggregated participant data. `,
                    operationId: 'getParticipants',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value. Specifies the phenotype id to retrieve participant data from.',
                            required: true,
                            type: 'integer',
                            value: '2250'
                        },
                        {
                            name: 'columns',
                            in: 'query',
                            description: `A comma-separated list of properties to group participant counts by. Can be entered as any combination of "value", "label", "sex", "age", "ancestry", and "genetic_ancestry". "Value" refers to the recorded value for the phenotype and "label" refers to the categorical label for that value (if applicable). "Sex" refers to participant sex, "age" refers to age at diagnosis, "ancestry" refers to self-reported race, and "genetic_ancestry" refers to genetically imputed ancestry.`,
                            required: false,
                            type: 'string',
                            value: 'value,age'
                        },
                        {
                            name: 'precision',
                            in: 'query',
                            description: 'This parameter is relevant only for continuous phenotypes (such as BMI or Height). Values are rounded to the specified precision, which can help reduce the number of distinct counts returned. For example, a precision of -1 rounds values to the nearest multiple of 10^1, and a precision of 2 rounds to the nearest multiple of 10^-2. ',
                            required: false,
                            type: 'integer',
                            value: '0'
                        },
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/pca': {
                get: {
                    tags: ['pca'],
                    summary: `Retrieves single phenotype's principal component data`,
                    description: `Retrieves single phenotype's principal component data.`,
                    operationId: 'getPCA',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'phenotype_id',
                            in: 'query',
                            description: 'A numeric value. Specifies the phenotype id for the PCs to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'platform',
                            in: 'query',
                            description: 'A string. Specifies the platform used.',
                            required: true,
                            type: 'string',
                            value: 'PLCO_GSA',
                            enum: ['PLCO_GSA', 'PLCO_Omni5', 'PLCO_Omni25', 'PLCO_Oncoarray', 'PLCO_OmniX'],
                        },
                        {
                            name: 'pc_x',
                            in: 'query',
                            description: 'A numeric value 1-20. Specifies the first PC to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '1'
                        },
                        {
                            name: 'pc_y',
                            in: 'query',
                            description: 'A numeric value 1-20. Specifies the second PC to retrieve.',
                            required: true,
                            type: 'integer',
                            value: '2'
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'A numeric value to limit the number of PCs returned.',
                            type: 'integer',
                            value: 10,
                            minimum: 0
                        },
                        {
                            name: 'raw',
                            in: 'query',
                            description: 'If true, returns data in an array of arrays instead of an array of objects.',
                            required: false,
                            type: 'string',
                            enum: ['true']
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            schema: {
                                type: 'array',
                                items: {
                                    $ref: '#/definitions/PCA'
                                }
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            // '/api/correlations': {
            //     get: {
            //         tags: ['correlations'],
            //         summary: 'TBD',
            //         description: 'TBD.',
            //         operationId: 'getCorrelations',
            //         produces: ['application/json'],
            //         // parameters: [
            //         //     {
            //         //         name: 'q',
            //         //         in: 'query',
            //         //         description: 'Query phenotypes that match keyword',
            //         //         type: 'string'
            //         //     }
            //         // ],
            //         responses: {
            //             '200': {
            //                 description: 'successful operation',
            //             },
            //             '500': {
            //                 description: 'service unavailable'
            //             }
            //         },
            //     },
            // },
        },
        definitions: {
            Metadata: {
                type: 'object',
                required: ['id', 'phenotype_id', 'phenotype_name', 'phenotype_display_name', 'sex', 'ancestry'],
                properties: {
                    id: {
                        type: 'integer',
                    },
                    phenotype_id: {
                        type: 'integer',
                    },
                    phenotype_name: {
                        type: 'string'
                    },
                    phenotype_display_name: {
                        type: 'string'
                    },
                    sex: {
                        type: 'string'
                    },
                    ancestry: {
                        type: 'string'
                    },
                    chromosome: {
                        type: 'string'
                    },
                    lambda_gc: {
                        type: 'number'
                    },
                    lambda_gc_ld_score: {
                        type: 'number'
                    },
                    count: {
                        type: 'integer'
                    }
                }
            },
            PCA: {
                type: 'object',
                required: ['pc_x', 'pc_y', 'ancestry', 'sex'],
                properties: {
                    pc_x: {
                        type: 'number'
                    },
                    pc_y: {
                        type: 'number'
                    },
                    ancestry: {
                        type: 'string'
                    },
                    sex: {
                        type: 'string'
                    },
                    value: {
                        type: 'number'
                    }
                }
            },
            Phenotypes: {
                type: 'object',
                required: ['id', 'name', 'display_name', 'description'],
                properties: {
                    id: {
                        type: 'integer',
                    },
                    name: {
                        type: 'string'
                    },
                    display_name: {
                        type: 'string'
                    },
                    description: {
                        type: 'string'
                    }
                }
            },
            Summary: {
                type: 'object',
                required: ['id', 'phenotype_id', 'sex', 'ancestry', 'chromosome', 'position_abs', 'p_value_nlog'],
                properties: {
                    id: {
                        type: 'integer',
                    },
                    phenotype_id: {
                        type: 'integer'
                    },
                    sex: {
                        type: 'string'
                    },
                    ancestry: {
                        type: 'string'
                    },
                    chromosome: {
                        type: 'integer'
                    },
                    position_abs: {
                        type: 'integer'
                    },
                    p_value_nlog: {
                        type: 'number'
                    }
                }
            },
            Variant: {
                type: 'object',
                required: [
                    'phenotype_id',
                    'sex',
                    'ancestry',
                    'id',
                    'chromosome',
                    'position',
                    'snp',
                    'allele_reference',
                    'allele_alternate',
                    'allele_frequency',
                    'p_value',
                    'p_value_heterogenous',
                    'p_value_nlog',
                    'n'
                ],
                properties: {
                    phenotype_id: {
                        type: 'integer',
                    },
                    sex: {
                        type: 'string'
                    },
                    ancestry: {
                        type: 'string'
                    },
                    id: {
                        type: 'integer',
                    },
                    chromosome: {
                        type: 'integer',
                    },
                    position: {
                        type: 'integer',
                    },
                    snp: {
                        type: 'string'
                    },
                    allele_reference: {
                        type: 'string'
                    },
                    allele_alternate: {
                        type: 'string'
                    },
                    allele_frequency: {
                        type: 'number'
                    },
                    p_value: {
                        type: 'number'
                    },
                    p_value_heterogenous: {
                        type: 'number'
                    },
                    p_value_nlog: {
                        type: 'number'
                    },
                    // p_value_nlog_expected: {
                    //   type: 'number'
                    // },
                    beta: {
                        type: 'number'
                    },
                    odds_ratio: {
                        type: 'number'
                    },
                    ci_95_low: {
                        type: 'number'
                    },
                    ci_95_high: {
                        type: 'number'
                    },
                    n: {
                        type: 'integer'
                    }
                }
            }
        },
    };

    return (
        <div className="mt-3 container bg-white tab-pane-bordered rounded-0 p-4">
            <h3 className="font-weight-light">API Access</h3>
            <hr />

            <p>
                The GWAS Atlas summary data are also accessible via a REST api. The api
                enables users to retrieve GWAS results in their preferred environment and
                offers more flexibility for querying data than does the web interface. The syntax
                needed to perform api calls is described below. Users can test queries interactively 
                using the web interface before accessing the api programmatically. Output is returned 
                in JSON format except when specifically indicated.
            </p>

            <p>
                Many api endpoints require a phenotype_id, which can be obtained by querying
                the /api/phenotypes route. For example, to find all cancer-associated phenotypes,
                users can send a GET request to the /api/phenotypes route with the following query
                parameters: <a href="api/phenotypes?q=cancer" target="blank">/api/phenotypes?q=cancer</a>. 
                This will retrieve an array of phenotype objects containing the phenotype_id, name, and 
                other properties. Phenotypes that have an import_count of 0 have not yet been imported 
                into the database, and will not have association results.
            </p>

            <p>
                If a query parameter is not provided then a hierarchical tree of all phenotypes
                will be returned, along with their associated metadata.
            </p>

            <SwaggerUI spec={swaggerSpec} />
        </div>
    );

}
