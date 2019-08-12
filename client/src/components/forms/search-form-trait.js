import React, { useState } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

export function SearchFormTrait({ params, onChange, onSubmit }) {
  const [listType, setListType] = useState('categorical');

  const categories = [
    'Sample Category A',
    'Sample Category B',
    'Sample Category C'
  ];

  const listItems = [
    {label:`(test) Ewing's sarcoma`, value: 'example', disabled: false},
    {label:'(test) Melanoma', children: null, disabled: true},
    {label:'(test) Renal cancer', children: null, disabled: true},
    {label:'Anthropometric measures', disabled: true},
    {label:'    Height', disabled: true},
    {label:'        Height when standing', children: null, disabled: true},
    {label:'        Height when sitting', children: null, disabled: true},
    {label:'    Weight', disabled: true},
    {label:'        BMI', children: null, disabled: true},
    {label:'        Weight Gain Area', children: null, disabled: true},
    {label:'        Weight Loss Area', children: null, disabled: true},
    {label:'        Waist-Hip Comparison', children: null, disabled: true},
    {label:'    Hair pattern at 45', children: null, disabled: true},
    {label:'Cancer', disabled: true},
    {label:'    All cancers', disabled: true},
    {label:'        By location', disabled: true},
    {label:'            Biliary cancer', disabled: true},
    {label:'            Bladder cancer', disabled: true},
    {label:'            Breast cancer', disabled: true},
    {label:'                Breast cancer (lobular)', children: null, disabled: true},
    {label:'                Breast cancer (ER positive)', children: null, disabled: true},
    {label:'                Breast cancer (PR positive)', children: null, disabled: true},
    {label:'                Breast cancer (ER/PR negative)', children: null, disabled: true},
    {label:'                Breast cancer (tubular)', children: null, disabled: true},
    {label:'            Colorectal cancer', disabled: true},
    {label:'                Colon cancer (distal)', children: null, disabled: true},
    {label:'                Colon cancer (proximal)', children: null, disabled: true},
    {label:'                Colorectal cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                Colorectal cancer (advanced)', children: null, disabled: true},
    {label:'                Rectal cancer', children: null, disabled: true},
    {label:'            Endometrial cancer', children: null, disabled: true},
    {label:'            Glioma cancer', children: null, disabled: true},
    {label:'            Head and neck cancer', children: null, disabled: true},
    {label:'            Hematologic malignancies', disabled: true},
    {label:'                Hodgkin lymphoma', children: null, disabled: true},
    {label:'                Lymphocytic leukemia', children: null, disabled: true},
    {label:'                Myeloid/Monocytic leukemia', children: null, disabled: true},
    {label:'                Myeloma', children: null, disabled: true},
    {label:'                Non-Hodgkin lymphoma', children: null, disabled: true},
    {label:'            Liver cancer', children: null, disabled: true},
    {label:'            Lung cancer', children: null, disabled: true},
    {label:'                Lung cancer (small cell)', children: null, disabled: true},
    {label:'                Lung cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                Lung cancer (squamous cell)', children: null, disabled: true},
    // {label:'            Melanoma', children: null, disabled: true},
    {label:'            Non-melanoma skin cancer', disabled: true},
    {label:'                Basal cell only', children: null, disabled: true},
    {label:'                Basal and squamous cell', children: null, disabled: true},
    {label:'                Squamous cell only', children: null, disabled: true},
    {label:'            Ovarian cancer', children: null, disabled: true},
    {label:'            Pancreatic cancer', children: null, disabled: true},
    {label:'            Prostate cancer', disabled: true},
    {label:'                Prostate cancer (advanced)', children: null, disabled: true},
    {label:'                Prostate cancer (not advanced)', children: null, disabled: true},
    // {label:'            Renal cancer', children: null, disabled: true},
    {label:'            Thyroid cancer', children: null, disabled: true},
    {label:'            Upper GI cancer', disabled: true},
    {label:'                Esophageal cancer', children: null, disabled: true},
    {label:'                Gastric cancer', children: null, disabled: true},
    {label:'        By pathology', disabled: true},
    {label:'            Solid tumors', disabled: true},
    {label:'                Carcinomas', disabled: true},
    {label:'                    Adenocarcinomas', disabled: true},
    {label:'                        Breast (adenocarcinoma)', children: null, disabled: true},
    {label:'                        Colorectal cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                        Endometrial cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                        Lung cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                        Pancreatic cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                        Prostate cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                        Thyroid cancer (adenocarcinoma)', children: null, disabled: true},
    {label:'                    Squamous cell cancers', disabled: true},
    {label:'                        Esophageal cancer (squamous cell)', children: null, disabled: true},
    {label:'                        Lung cancer (squamous cell)', children: null, disabled: true},
    {label:'                    Urothelial cancers', disabled: true},
    {label:'                        Bladder cancer (urothelial)', children: null, disabled: true},
    {label:'                        Renal cancer (urothelial)', children: null, disabled: true},
    {label:'                Sarcomas', disabled: true},
    {label:'                    Need to look into', children: null, disabled: true},
    {label:'                Neuroendocrine related cancers', disabled: true},
    {label:'                    Lung cancer (neuroendocrine)', children: null, disabled: true},
    {label:'                    Pancreatic cancer (neuroendocrine)', children: null, disabled: true},
    {label:'                    Thyroid cancer (neuroendocrine)', children: null, disabled: true},
    {label:'            Hematologic malignancies', disabled: true},
    {label:'                Hodgkin’s lymphoma', children: null, disabled: true},
    {label:'                Non-Hodgkin’s lymphoma', children: null, disabled: true},
    {label:'                Multiple myeloma', children: null, disabled: true},
    {label:'        By risk factor', disabled: true},
    {label:'            Smoking related cancers', disabled: true},
    {label:'                Lung cancer', children: null, disabled: true},
    {label:'                Bladder cancer', children: null, disabled: true},
    {label:'            Obesity related cancers', disabled: true},
    {label:'                Breast cancer', children: null, disabled: true},
    {label:'                Colorectal cancer', children: null, disabled: true},
    {label:'                Esophageal cancer', children: null, disabled: true},
    {label:'                Kidney cancer', children: null, disabled: true},
    {label:'            Hormone-related cancers', disabled: true},
    {label:'                Breast cancer', children: null, disabled: true},
    {label:'                Endometrial cancer', children: null, disabled: true},
    {label:'                Ovarian cancer', children: null, disabled: true},
    {label:'                Prostate cancer', children: null, disabled: true},
    {label:'            Physical activity related cancers', disabled: true},
    {label:'                Need to look into', children: null, disabled: true},
    {label:'            Alcohol-related cancers', disabled: true},
    {label:'                Breast cancer', children: null, disabled: true},
    {label:'                Liver cancer', children: null, disabled: true},
    {label:'            Infection-related cancers', disabled: true},
    {label:'                H. pylori cancers', disabled: true},
    {label:'                    Gastric cancer', children: null, disabled: true},
    {label:'                HPV-related cancers', disabled: true},
    {label:'                    Cervical cancer', children: null, disabled: true},
    {label:'                    Head and neck cancer', children: null, disabled: true},
    {label:'    Family history of cancer', children: null, disabled: true},
    {label:'Lifestyle factors', disabled: true},
    {label:'    Alcohol consumption', children: null, disabled: true},
    {label:'    Diet', disabled: true},
    {label:'        Caffeine intake', children: null, disabled: true},
    {label:'        Fat intake', children: null, disabled: true},
    {label:'        Protein intake', children: null, disabled: true},
    {label:'    Exercise', disabled: true},
    {label:'        Flights of stairs', children: null, disabled: true},
    {label:'        Light activity duration', children: null, disabled: true},
    {label:'        Mile walk frequency', children: null, disabled: true},
    {label:'        Moderate activity duration', children: null, disabled: true},
    {label:'        Strenuous activity frequency', children: null, disabled: true},
    {label:'        Strenuous activity duration', children: null, disabled: true},
    {label:'        Vigorous activity at 40', children: null, disabled: true},
    {label:'        Vigorous activity current', children: null, disabled: true},
    {label:'        Walking pace', children: null, disabled: true},
    {label:'    Smoking', disabled: true},
    {label:'        Cigarette smoking status', children: null, disabled: true},
    {label:'        Cigarette type', children: null, disabled: true},
    {label:'        Cigarettes per day', children: null, disabled: true},
    {label:'        Experience cigarette cravings', children: null, disabled: true},
    {label:'        Filtered or Non-filtered', children: null, disabled: true},
    {label:'        Menthol or non-menthol', children: null, disabled: true},
    {label:'        Number of cigarettes smoked per day', children: null, disabled: true},
    {label:'        Wake up smoke', children: null, disabled: true},
    {label:'Medical conditions', disabled: true},
    {label:'    Arthritis', children: null, disabled: true},
    {label:'    Asthma', children: null, disabled: true},
    {label:'    Benign ovarian cyst/tumor', children: null, disabled: true},
    {label:'    Broken bone', disabled: true},
    {label:'        Broken arm', children: null, disabled: true},
    {label:'        Broken hip', children: null, disabled: true},
    {label:'        Broken vertebra', children: null, disabled: true},
    {label:'        Broken other', children: null, disabled: true},
    {label:'    Bronchitis', children: null, disabled: true},
    {label:'    Cirrhosis', children: null, disabled: true},
    {label:'    Colorectal polyps', children: null, disabled: true},
    {label:'    Crohn’s disease', children: null, disabled: true},
    {label:'    Diabetes', children: null, disabled: true},
    {label:'    Diverticulitis/Diverticulosis', children: null, disabled: true},
    {label:'    Emphysema', children: null, disabled: true},
    {label:'    Endometriosis', children: null, disabled: true},
    {label:'    Enlarged prostate of BPH', children: null, disabled: true},
    {label:'    Fibrotic breast disease', children: null, disabled: true},
    {label:'    Gallbladder stones or inflammation', children: null, disabled: true},
    {label:'    Heart attack', children: null, disabled: true},
    {label:'    Hepatitis', children: null, disabled: true},
    {label:'    High cholesterol', children: null, disabled: true},
    {label:'    Hypertension', children: null, disabled: true},
    {label:'    Inflamed prostate', children: null, disabled: true},
    {label:'    Osteoporosis', children: null, disabled: true},
    {label:'    Stroke', children: null, disabled: true},
    {label:'    Ulcerative colitis', children: null, disabled: true},
    {label:'    Uterine fibroid tumors', children: null, disabled: true},
    {label:'Reproductive factors', disabled: true},
    {label:'    Age of menarche', children: null, disabled: true},
    {label:'    Age of menopause', children: null, disabled: true},
    {label:'    Ever try to become pregnant without success', children: null, disabled: true},
    {label:'Mortality', disabled: true},
    {label:'    All-cause mortality', children: null, disabled: true},
    {label:'    Cancer-specific mortality', children: null, disabled: true},
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
                return <option value={t.value} disabled={t.disabled}>
                  {spaces + t.label}
                  </option>
              })}

            {listType == 'alphabetic' &&
              listItems
                .filter(t => t.children === null)
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(t => <option value={t.value} disabled={ t.disabled }>{t.label}</option>)}
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
