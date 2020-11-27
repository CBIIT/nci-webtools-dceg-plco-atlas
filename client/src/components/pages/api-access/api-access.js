import React from 'react';
import { SwaggerUI } from '../../controls/swagger-ui/swagger-ui'

export function ApiAccess() {

  const swaggerSpec = {
      swagger: '2.0',
      host: window.location.host,
      basePath: window.location.host.includes("localhost") ? '' : '/plco-atlas',
      tags: [
          {
              name: 'phenotypes',
              description: 'Everything about phenotypes',
          },
          {
              name: 'variants',
              description: 'Everything about variants'
          }
      ],
      paths: {
          '/api/phenotypes': {
              get: {
                  tags: ['phenotypes'],
                  summary: 'Find phenotypes',
                  description: 'Returns all phenotypes if no query is provided',
                  operationId: 'getPhenotypes',
                  produces: ['application/json'],
                  parameters: [
                  {
                      name: 'q',
                      in: 'query',
                      description: 'Query phenotypes that match keyword',
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
                      '404': {
                          description: 'phenotype(s) not found'
                      }
                  },
              },
          },
          '/api/variants': {
              get: {
                  tags: ['variants'],
                  summary: 'Find variants for queried phenotype(s)',
                  description: 'Returns variants for queried phenotype(s)',
                  operationId: 'getVariants',
                  produces: ['application/json'],
                  parameters: [
                      {
                          name: 'phenotype_id',
                          in: 'query',
                          description: 'Specify id(s) of specific phenotype(s) to return. Separate multiple ids with commas.',
                          required: true,
                          type: 'integer'
                      },
                      {
                          name: 'sex',
                          in: 'query',
                          description: 'Specify sex stratification',
                          required: true,
                          type: 'string',
                          enum: ['all', 'female', 'male']
                      },
                      {
                          name: 'ancestry',
                          in: 'query',
                          description: 'Specify ancestry stratification',
                          required: true,
                          type: 'string',
                          enum: [
                          'east_asian', 
                          'european'
                          ]
                      },
                      {
                          name: 'id',
                          in: 'query',
                          description: 'Query id of specific variant to return',
                          type: 'integer'
                      },
                      {
                          name: 'snp',
                          in: 'query',
                          description: 'Query RSID or CHR:POS of specific variant to return',
                          type: 'string'
                      },
                      {
                          name: 'chromosome',
                          in: 'query',
                          description: 'Specify a chromosome value 1-22',
                          type: 'integer',
                          minimum: 1,
                          maximum: 22
                      },
                      {
                          name: 'position',
                          in: 'query',
                          description: 'Specify exact position on chromosome',
                          type: 'integer'
                      },
                      {
                          name: 'position_min',
                          in: 'query',
                          description: 'Specify minimum position value',
                          type: 'integer'
                      },
                      {
                          name: 'position_max',
                          in: 'query',
                          description: 'Specify maximum position value',
                          type: 'integer'
                      },
                      {
                          name: 'p_value_min',
                          in: 'query',
                          description: 'Specify minimum p-value',
                          type: 'number'
                      },
                      {
                          name: 'p_value_max',
                          in: 'query',
                          description: 'Specify maximum p-value',
                          type: 'number'
                      },
                      {
                          name: 'p_value_nlog_min',
                          in: 'query',
                          description: 'Specify minimum -log10(p-value)',
                          type: 'number'
                      },
                      {
                          name: 'p_value_nlog_max',
                          in: 'query',
                          description: 'Specify maximum -log10(p-value)',
                          type: 'number'
                      },
                      {
                          name: 'columns',
                          in: 'query',
                          description: 'Specify name(s) of column(s) returned. Separate multiple column names with commas.',
                          type: 'string'
                      },
                      {
                          name: 'offset',
                          in: 'query',
                          description: 'Specify numeric offset',
                          type: 'integer'
                      },
                      {
                          name: 'limit',
                          in: 'query',
                          description: 'Specify number of records to fetch',
                          type: 'integer',
                          value: 10
                      },
                      {
                          name: 'orderBy',
                          in: 'query',
                          description: 'Specify which column to order by (default: p-value)',
                          type: 'string'
                      },
                      {
                          name: 'order',
                          in: 'query',
                          description: 'Specify ascending or descending order',
                          type: 'string',
                          enum: ['asc', 'desc']
                      },
                      {
                          name: 'raw',
                          in: 'query',
                          description: 'If true, variants will be returned an array of arrays',
                          type: 'string',
                          enum: ['true']
                      },
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
                          description: 'invalid query / no data'
                      },
                  },
              },
          }
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
      }
  };

  return (
    <div className="mt-3 container bg-white tab-pane-bordered rounded-0 p-4">
      <h1 className="font-weight-light">API Access</h1>
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
