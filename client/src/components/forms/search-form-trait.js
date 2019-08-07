import React, { useState } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

export function SearchFormTrait({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('alphabetic');

  const categories = [
    'Sample Category A',
    'Sample Category B',
    'Sample Category C'
  ];

  const listItems = [
    {label:`(test) Ewing's sarcoma`, value: 'example'},,
    {label:'Anthropometric measures',},
    {label:'    Height',},
    {label:'        Height when standing', children: null},
    {label:'        Height when sitting', children: null},
    {label:'    Weight',},
    {label:'        BMI', children: null},
    {label:'        Weight Gain Area', children: null},
    {label:'        Weight Loss Area', children: null},
    {label:'        Waist-Hip Comparison', children: null},
    {label:'    Hair pattern at 45', children: null},
    {label:'Cancer',},
    {label:'    All cancers',},
    {label:'        By location',},
    {label:'            Biliary cancer',},
    {label:'            Bladder cancer',},
    {label:'            Breast cancer',},
    {label:'                Breast cancer (lobular)', children: null},
    {label:'                Breast cancer (ER positive)', children: null},
    {label:'                Breast cancer (PR positive)', children: null},
    {label:'                Breast cancer (ER/PR negative)', children: null},
    {label:'                Breast cancer (tubular)', children: null},
    {label:'            Colorectal cancer',},
    {label:'                Colon cancer (distal)', children: null},
    {label:'                Colon cancer (proximal)', children: null},
    {label:'                Colorectal cancer (adenocarcinoma)', children: null},
    {label:'                Colorectal cancer (advanced)', children: null},
    {label:'                Rectal cancer', children: null},
    {label:'            Endometrial cancer', children: null},
    {label:'            Glioma cancer', children: null},
    {label:'            Head and neck cancer', children: null},
    {label:'            Hematologic malignancies',},
    {label:'                Hodgkin lymphoma', children: null},
    {label:'                Lymphocytic leukemia', children: null},
    {label:'                Myeloid/Monocytic leukemia', children: null},
    {label:'                Myeloma', children: null},
    {label:'                Non-Hodgkin lymphoma', children: null},
    {label:'            Liver cancer', children: null},
    {label:'            Lung cancer', children: null},
    {label:'                Lung cancer (small cell)', children: null},
    {label:'                Lung cancer (adenocarcinoma)', children: null},
    {label:'                Lung cancer (squamous cell)', children: null},
    {label:'            Melanoma', children: null},
    {label:'            Non-melanoma skin cancer',},
    {label:'                Basal cell only', children: null},
    {label:'                Basal and squamous cell', children: null},
    {label:'                Squamous cell only', children: null},
    {label:'            Ovarian cancer', children: null},
    {label:'            Pancreatic cancer', children: null},
    {label:'            Prostate cancer',},
    {label:'                Prostate cancer (advanced)', children: null},
    {label:'                Prostate cancer (not advanced)', children: null},
    {label:'            Renal cancer', children: null},
    {label:'            Thyroid cancer', children: null},
    {label:'            Upper GI cancer',},
    {label:'                Esophageal cancer', children: null},
    {label:'                Gastric cancer', children: null},
    {label:'        By pathology',},
    {label:'            Solid tumors',},
    {label:'                Carcinomas',},
    {label:'                    Adenocarcinomas',},
    {label:'                        Breast (adenocarcinoma)', children: null},
    {label:'                        Colorectal cancer (adenocarcinoma)', children: null},
    {label:'                        Endometrial cancer (adenocarcinoma)', children: null},
    {label:'                        Lung cancer (adenocarcinoma)', children: null},
    {label:'                        Pancreatic cancer (adenocarcinoma)', children: null},
    {label:'                        Prostate cancer (adenocarcinoma)', children: null},
    {label:'                        Thyroid cancer (adenocarcinoma)', children: null},
    {label:'                    Squamous cell cancers',},
    {label:'                        Esophageal cancer (squamous cell)', children: null},
    {label:'                        Lung cancer (squamous cell)', children: null},
    {label:'                    Urothelial cancers',},
    {label:'                        Bladder cancer (urothelial)', children: null},
    {label:'                        Renal cancer (urothelial)', children: null},
    {label:'                Sarcomas',},
    {label:'                    Need to look into', children: null},
    {label:'                Neuroendocrine related cancers',},
    {label:'                    Lung cancer (neuroendocrine)', children: null},
    {label:'                    Pancreatic cancer (neuroendocrine)', children: null},
    {label:'                    Thyroid cancer (neuroendocrine)', children: null},
    {label:'            Hematologic malignancies',},
    {label:'                Hodgkin’s lymphoma', children: null},
    {label:'                Non-Hodgkin’s lymphoma', children: null},
    {label:'                Multiple myeloma', children: null},
    {label:'        By risk factor',},
    {label:'            Smoking related cancers',},
    {label:'                Lung cancer', children: null},
    {label:'                Bladder cancer', children: null},
    {label:'            Obesity related cancers',},
    {label:'                Breast cancer', children: null},
    {label:'                Colorectal cancer', children: null},
    {label:'                Esophageal cancer', children: null},
    {label:'                Kidney cancer', children: null},
    {label:'            Hormone-related cancers',},
    {label:'                Breast cancer', children: null},
    {label:'                Endometrial cancer', children: null},
    {label:'                Ovarian cancer', children: null},
    {label:'                Prostate cancer', children: null},
    {label:'            Physical activity related cancers',},
    {label:'                Need to look into', children: null},
    {label:'            Alcohol-related cancers',},
    {label:'                Breast cancer', children: null},
    {label:'                Liver cancer', children: null},
    {label:'            Infection-related cancers',},
    {label:'                H. pylori cancers',},
    {label:'                    Gastric cancer', children: null},
    {label:'                HPV-related cancers',},
    {label:'                    Cervical cancer', children: null},
    {label:'                    Head and neck cancer', children: null},
    {label:'    Family history of cancer', children: null},
    {label:'Lifestyle factors',},
    {label:'    Alcohol consumption', children: null},
    {label:'    Diet',},
    {label:'        Caffeine intake', children: null},
    {label:'        Fat intake', children: null},
    {label:'        Protein intake', children: null},
    {label:'    Exercise',},
    {label:'        Flights of stairs', children: null},
    {label:'        Light activity duration', children: null},
    {label:'        Mile walk frequency', children: null},
    {label:'        Moderate activity duration', children: null},
    {label:'        Strenuous activity frequency', children: null},
    {label:'        Strenuous activity duration', children: null},
    {label:'        Vigorous activity at 40', children: null},
    {label:'        Vigorous activity current', children: null},
    {label:'        Walking pace', children: null},
    {label:'    Smoking',},
    {label:'        Cigarette smoking status', children: null},
    {label:'        Cigarette type', children: null},
    {label:'        Cigarettes per day', children: null},
    {label:'        Experience cigarette cravings', children: null},
    {label:'        Filtered or Non-filtered', children: null},
    {label:'        Menthol or non-menthol', children: null},
    {label:'        Number of cigarettes smoked per day', children: null},
    {label:'        Wake up smoke', children: null},
    {label:'Medical conditions',},
    {label:'    Arthritis', children: null},
    {label:'    Asthma', children: null},
    {label:'    Benign ovarian cyst/tumor', children: null},
    {label:'    Broken bone',},
    {label:'        Broken arm', children: null},
    {label:'        Broken hip', children: null},
    {label:'        Broken vertebra', children: null},
    {label:'        Broken other', children: null},
    {label:'    Bronchitis', children: null},
    {label:'    Cirrhosis', children: null},
    {label:'    Colorectal polyps', children: null},
    {label:'    Crohn’s disease', children: null},
    {label:'    Diabetes', children: null},
    {label:'    Diverticulitis/Diverticulosis', children: null},
    {label:'    Emphysema', children: null},
    {label:'    Endometriosis', children: null},
    {label:'    Enlarged prostate of BPH', children: null},
    {label:'    Fibrotic breast disease', children: null},
    {label:'    Gallbladder stones or inflammation', children: null},
    {label:'    Heart attack', children: null},
    {label:'    Hepatitis', children: null},
    {label:'    High cholesterol', children: null},
    {label:'    Hypertension', children: null},
    {label:'    Inflamed prostate', children: null},
    {label:'    Osteoporosis', children: null},
    {label:'    Stroke', children: null},
    {label:'    Ulcerative colitis', children: null},
    {label:'    Uterine fibroid tumors', children: null},
    {label:'Reproductive factors',},
    {label:'    Age of menarche', children: null},
    {label:'    Age of menopause', children: null},
    {label:'    Ever try to become pregnant without success', children: null},
    {label:'Mortality',},
    {label:'    All-cause mortality', children: null},
    {label:'    Cancer-specific mortality', children: null},
  ];

  const phenotypes = [
    {
      value: `example`,
      label: `Ewing's Sarcoma`,
      category: 'Sample Category A'
    },
    {
      value: `example_2a`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category A'
    },
    {
      value: `example_1b`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category B'
    },
    {
      value: `example_2b`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category B'
    },
    {
      value: `example_1c`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category C'
    },
    {
      value: `example_2c`,
      label: `Sample phenotype 2A`,
      category: 'Sample Category C'
    }
  ];

  return (
    <Form>
      <Form.Group controlId="phenotype-list">
        <Form.Label>
          <b>Phenotype List</b>
        </Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <select
              class="form-control"
              value={listType}
              onChange={e => setListType(e.target.value)}>
              <option value="alphabetic">Alphabetic</option>
              <option value="categorical">Categorical</option>
            </select>
          </InputGroup.Prepend>

          <select
            class="form-control"
            value={params.phenotype}
            onChange={e => onChange({ ...params, phenotype: e.target.value })}>
            <option hidden>(Select a phenotype)</option>

            {listType == 'categorical' &&
              listItems.map(t => {
                let numSpaces = t.label.length - t.label.trimLeft().length;
                let spaces = '';
                while (--numSpaces > 0)
                  spaces += '\u00a0'
                return <option value={t.value}>
                  {spaces + t.label}
                  </option>
              })}

            {listType == 'alphabetic' &&
              listItems
                .filter(t => t.children === null)
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(t => <option value={t.value}>{t.label}</option>)}
          </select>
          <InputGroup.Append>
            <button className="btn btn-primary" onClick={onSubmit}>
              Submit
            </button>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}
