import React from 'react';
import { SwaggerUI } from '../../controls/swagger-ui/swagger-ui'
import './api-access.scss';

export function ApiAccess() {

    const swaggerSpec = {
        swagger: '2.0',
        host: window.location.host,
        basePath: window.location.host.includes("localhost") ? '' : '/plco-atlas',
        tags: [
            {
                name: 'ping',
            },
            {
                name: 'summary',
            },
            {
                name: 'variants',
            },
            {
                name: 'points',
            },
            {
                name: 'metadata',
            },
            {
                name: 'phenotypes',
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
                            enum: ['all', 'female', 'male']
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the summarized variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'east_asian',
                                'european'
                            ]
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
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
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
                            enum: ['all', 'female', 'male']
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'east_asian',
                                'european'
                            ]
                        },
                        {
                            name: 'chromosome',
                            in: 'query',
                            description: 'A chromosome number ("X" and "Y" chromosomes may be added in the future). Specifies the chromosome for the variants to retrieve.',
                            required: true,
                            type: 'integer',
                            minimum: 1,
                            maximum: 22,
                            value: 8
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
                            enum: ['all', 'female', 'male']
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'east_asian',
                                'european'
                            ]
                        },
                        {
                            name: 'chromosome',
                            in: 'query',
                            description: 'A chromosome number ("X" and "Y" chromosomes may be added in the future). Specifies the chromosome for the variants to retrieve.',
                            required: true,
                            type: 'integer',
                            minimum: 1,
                            maximum: 22,
                            value: 8
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
                            enum: ['all', 'female', 'male']
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'east_asian',
                                'european'
                            ]
                        },
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
                        <li>ancestry - east_asian, european, (TBD) - ancestry for metadata entry</li>
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
                            enum: ['all', 'female', 'male']
                        },
                        {
                            name: 'ancestry',
                            in: 'query',
                            description: 'Either "east_asian" or "european" (other ancestries TBD). Specifies the ancestries for the variants to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                'east_asian',
                                'european'
                            ]
                        },
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
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'successful operation',
                            schema: {
                                type: 'array',
                                items: {
                                    $ref: '#/definitions/Phenotype'
                                }
                            }
                        },
                        '500': {
                            description: 'service unavailable'
                        }
                    },
                },
            },
            '/api/phenotype': {
                get: {
                    tags: ['phenotypes'],
                    summary: `Retrieves single phenotype's participant data and/or related phenotypes`,
                    description: `Retrieves single phenotype's participant data and/or related phenotypes.`,
                    operationId: 'getPhenotype',
                    produces: ['application/json'],
                    parameters: [
                        {
                            name: 'id',
                            in: 'query',
                            description: 'A numeric value. Specifies the phenotype id to retrieve data about.',
                            required: true,
                            type: 'integer',
                            value: '3080'
                        },
                        {
                            name: 'type',
                            in: 'query',
                            description: 'Either "frequency", "frequencyByAge", "frequencyBySex", "frequencyByAncestry", or "related". Specifies type of data to retrieve.',
                            required: true,
                            type: 'string',
                            enum: [
                                "frequency",
                                "frequencyByAge", 
                                "frequencyBySex", 
                                "frequencyByAncestry",
                                "related"
                            ]                        },
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
            Phenotype: {
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
                The GWAS Atlas summary statistic data are also accessible by command line
                from a terminal using the GWAS Atlas API server. This programmatic access
                facilitates researchers who are interested in performing more advanced queries,
                batch queries, or downloading results for specific genomic regions. The syntax
                needed to perform these API calls are explained in detail below with the ability
                to interactively test queries using the web interface before accessing the API
                programmatically. Generally, text output is returned in JSON format for easy
                manipulation and data storage.
      </p>

            <SwaggerUI spec={swaggerSpec} />
        </div>
    );

}
