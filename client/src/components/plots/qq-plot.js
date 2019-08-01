import React, { useState, useRef } from 'react';
// import { rawQuery as query } from '../../services/query';
// import { Button, Form, FormControl } from 'react-bootstrap';
// import * as d3 from 'd3';

export function QQPlot(props) {
  // const plotContainer = useRef(null);
  // const [timestamp, setTimestamp] = useState(0);
  // const [loading, setLoading] = useState(false);
  // const [params, setParams] = useState({
  //   database: 'example',
  //   chr: 10,
  //   nlogpMin: 3,
  //   nlogpMax: 20,
  //   bpMin: 0,
  //   bpMax: 10e7
  // });
  const [debugQuery, setDebugQuery] = useState({});
  // const [debug1, setDebug1] = useState({});
  // const [debug2, setDebug2] = useState({});
  // const [debug3, setDebug3] = useState({});
  // const [debugQQPoints, setDebugQQPoints] = useState({});

  return (
    <>
      <div>
        <pre>{ JSON.stringify(debugQuery, null, 2) }</pre>
      </div>
      <div className="text-center">
        <img
          src="assets/images/qq-plots/ewings_sarcoma.png"
          alt="QQ-plot of selected trait"
          useMap="#image-map"
        />
        <map name="image-map">
          <area shape="rect" coords="741,88,747,80" alt="point_1	1:869121	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="697,141,703,133" alt="point_2	1:5665513	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="677,141,683,134" alt="point_3	1:34044616	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="663,141,669,134" alt="point_4	1:65187438	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="653,143,659,135" alt="point_5	1:69771179	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="645,146,651,138" alt="point_6	1:78317564	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="638,146,644,138" alt="point_7	1:84203044	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="633,146,639,138" alt="point_8	1:110408241	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="628,146,634,138" alt="point_9	1:112788376	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="623,146,629,139" alt="point_10	1:115906457	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="619,147,625,139" alt="point_11	1:116117652	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="615,147,621,139" alt="point_12	1:152229333	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="612,148,618,140" alt="point_13	1:152238264	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="609,148,615,140" alt="point_14	1:153834298	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="606,148,612,140" alt="point_15	1:158265687	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="604,148,610,140" alt="point_16	1:161251769	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="601,148,607,141" alt="point_17	1:164512877	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="599,148,605,141" alt="point_18	1:177472877	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="596,149,602,141" alt="point_19	1:202095531	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="594,149,600,141" alt="point_20	1:211079618	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="592,149,598,142" alt="point_21	1:216745245	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="590,150,596,142" alt="point_22	1:222129049	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="589,150,595,142" alt="point_23	1:242360934	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="587,150,593,142" alt="point_24	1:247226344	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="585,150,591,142" alt="point_25	2:651382	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="584,150,590,142" alt="point_26	2:8703350	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="582,151,588,143" alt="point_27	2:13137599	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="581,152,587,144" alt="point_28	2:15372731	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="579,152,585,144" alt="point_29	2:16937318	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="578,152,584,144" alt="point_30	2:21475944	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="576,152,582,145" alt="point_31	2:27065449	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="575,152,581,145" alt="point_32	2:33621348	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="574,153,580,145" alt="point_33	2:34557763	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="573,153,579,145" alt="point_34	2:41714662	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="572,153,578,145" alt="point_35	2:42711419	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="570,153,576,146" alt="point_36	2:50126245	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="569,154,575,146" alt="point_37	2:73848933	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="568,154,574,146" alt="point_38	2:102613299	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="567,156,573,148" alt="point_39	2:109810800	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="566,157,572,149" alt="point_40	2:115450301	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="565,160,571,152" alt="point_41	2:124090496	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="564,161,570,153" alt="point_42	2:124090531	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="563,161,569,153" alt="point_43	2:128392468	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="562,163,568,155" alt="point_44	2:137435956	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="561,166,567,158" alt="point_45	2:143803847	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="560,167,566,159" alt="point_46	2:160311382	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="560,168,566,161" alt="point_47	2:172415450	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="559,170,565,162" alt="point_48	2:193326547	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="558,170,564,162" alt="point_49	2:201576053	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="557,171,563,163" alt="point_50	2:202419367	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="556,173,562,165" alt="point_51	2:202419507	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="555,174,561,166" alt="point_52	2:202419622	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="555,174,561,166" alt="point_53	2:202420067	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="554,174,560,166" alt="point_54	2:202420552	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="553,174,559,166" alt="point_55	2:202420764	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="553,174,558,166" alt="point_56	2:202421282	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="552,174,558,166" alt="point_57	2:202421559	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="551,174,557,166" alt="point_58	2:202421914	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="550,175,556,167" alt="point_59	2:202422216	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="550,175,556,167" alt="point_60	2:202422268	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="549,175,555,167" alt="point_61	2:202422496	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="548,175,554,168" alt="point_62	2:202422709	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="548,176,554,168" alt="point_63	2:202422795	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="547,177,553,169" alt="point_64	2:202423172	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="546,178,552,170" alt="point_65	2:202423507	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="546,178,552,170" alt="point_66	2:202423761	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="545,178,551,170" alt="point_67	2:202425545	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="545,178,551,170" alt="point_68	2:202425664	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="544,180,550,172" alt="point_69	2:202425695	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="544,180,549,172" alt="point_70	2:202425702	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="543,181,549,173" alt="point_71	2:202425913	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="542,181,548,173" alt="point_72	2:202426017	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="542,181,548,173" alt="point_73	2:202426355	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="541,181,547,173" alt="point_74	2:202426467	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="541,181,547,173" alt="point_75	2:202426567	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="540,181,546,173" alt="point_76	2:202426653	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="540,181,546,173" alt="point_77	2:202429193	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="539,181,545,173" alt="point_78	2:202430584	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="539,182,545,174" alt="point_79	2:202430679	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="538,182,544,174" alt="point_80	2:217270394	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="538,182,544,174" alt="point_81	2:217270450	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="537,183,543,175" alt="point_82	2:217270918	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="537,184,543,176" alt="point_83	3:12735637	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="536,184,542,176" alt="point_84	3:20508526	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="536,184,542,176" alt="point_85	3:22165478	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="535,184,541,176" alt="point_86	3:35170994	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="535,184,541,176" alt="point_87	3:36817328	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="534,184,540,176" alt="point_88	3:46137970	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="534,184,540,176" alt="point_89	3:57055343	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="533,184,539,176" alt="point_90	3:58273743	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="533,184,539,177" alt="point_91	3:69869617	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="533,184,538,177" alt="point_92	3:110224103	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="532,185,538,177" alt="point_93	3:122234615	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="532,185,538,177" alt="point_94	3:125680151	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="531,185,537,177" alt="point_95	3:126606492	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="531,185,537,177" alt="point_96	3:137580228	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="530,185,536,177" alt="point_97	3:142846370	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="530,185,536,177" alt="point_98	3:145529925	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="530,186,536,178" alt="point_99	3:152806318	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="529,186,535,178" alt="point_100	3:171608370	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="529,187,535,179" alt="point_101	3:185524081	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="528,187,534,179" alt="point_102	3:191172985	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="528,187,534,179" alt="point_103	3:194078002	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="528,187,534,179" alt="point_104	3:195473391	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="527,188,533,180" alt="point_105	3:195746908	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="527,188,533,180" alt="point_106	3:195838911	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="526,188,532,180" alt="point_107	4:3874052	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="526,188,532,180" alt="point_108	4:4077395	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="526,188,532,180" alt="point_109	4:4856579	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="525,189,531,181" alt="point_110	4:6325544	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="525,190,531,182" alt="point_111	4:15081864	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="525,191,531,183" alt="point_112	4:17699039	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="524,192,530,184" alt="point_113	4:21017775	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="524,193,530,185" alt="point_114	4:26147138	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="524,194,530,186" alt="point_115	4:32367310	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="523,194,529,186" alt="point_116	4:34355318	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="523,194,529,186" alt="point_117	4:64290189	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="522,197,528,190" alt="point_118	4:64290196	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="522,199,528,192" alt="point_119	4:64488898	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="522,208,528,200" alt="point_120	4:83325914	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="521,209,527,201" alt="point_121	4:83590099	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="521,210,527,202" alt="point_122	4:88922734	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="521,212,527,204" alt="point_123	4:116986018	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="521,220,526,212" alt="point_124	4:125437889	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="520,222,526,214" alt="point_125	4:157366246	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="520,222,526,214" alt="point_126	4:173667417	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="520,226,526,218" alt="point_127	4:173669613	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="519,227,525,219" alt="point_128	4:183896181	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="519,228,525,221" alt="point_129	4:188051175	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="519,231,525,223" alt="point_130	5:4799060	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="518,234,524,226" alt="point_131	5:7578674	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="518,239,524,231" alt="point_132	5:15823365	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="518,239,524,232" alt="point_133	5:17255364	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="517,241,523,233" alt="point_134	5:25578655	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="517,241,523,233" alt="point_135	5:73212507	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="517,242,523,234" alt="point_136	5:78444148	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="516,244,522,236" alt="point_137	5:101169258	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="516,246,522,239" alt="point_138	5:111582288	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="516,247,522,239" alt="point_139	5:114175565	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="516,247,522,239" alt="point_140	5:117457353	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="515,248,521,240" alt="point_141	5:134846562	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="515,249,521,241" alt="point_142	5:148924068	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="515,250,521,242" alt="point_143	5:158886939	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="514,253,520,245" alt="point_144	5:159815377	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="514,255,520,247" alt="point_145	5:179722699	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="514,255,520,247" alt="point_146	5:179723445	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="514,255,520,247" alt="point_147	6:3852233	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="513,255,519,248" alt="point_148	6:26426301	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="513,256,519,248" alt="point_149	6:32608589	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="513,257,519,249" alt="point_150	6:33051845	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="513,257,519,249" alt="point_151	6:36967614	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="512,257,518,249" alt="point_152	6:37648778	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="512,257,518,250" alt="point_153	6:38761296	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="512,258,518,250" alt="point_154	6:39301627	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="512,258,518,250" alt="point_155	6:47149297	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="511,259,517,251" alt="point_156	6:48414688	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="511,259,517,251" alt="point_157	6:54823431	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="511,259,517,251" alt="point_158	6:54879099	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="511,259,517,251" alt="point_159	6:66153462	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="510,259,516,251" alt="point_160	6:66452510	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="510,259,516,252" alt="point_161	6:78675271	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="510,259,516,252" alt="point_162	6:112336716	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="510,260,516,253" alt="point_163	6:115853024	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="509,261,515,253" alt="point_164	6:118443045	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="509,261,515,253" alt="point_165	6:121843294	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="509,261,515,253" alt="point_166	6:133633350	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="509,261,515,254" alt="point_167	6:140136531	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="508,262,514,254" alt="point_168	6:141807873	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="508,262,514,254" alt="point_169	6:143116005	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="508,263,514,255" alt="point_170	6:146739230	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="508,263,514,255" alt="point_171	6:151778934	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="507,264,513,256" alt="point_172	7:1095471	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="507,264,513,256" alt="point_173	7:5873080	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="507,264,513,256" alt="point_174	7:8610841	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="507,264,513,257" alt="point_175	7:8851998	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="506,265,512,258" alt="point_176	7:16445066	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="506,267,512,259" alt="point_177	7:29954693	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="506,268,512,260" alt="point_178	7:31911298	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="506,270,512,262" alt="point_179	7:47029506	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="506,271,512,263" alt="point_180	7:47554347	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="505,272,511,264" alt="point_181	7:55030269	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="505,272,511,265" alt="point_182	7:57208666	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="505,273,511,265" alt="point_183	7:82428904	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="505,273,511,265" alt="point_184	7:82998022	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="504,274,510,266" alt="point_185	7:86456833	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="504,274,510,266" alt="point_186	7:89685507	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="504,274,510,266" alt="point_187	7:107442370	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="504,277,510,269" alt="point_188	7:108493447	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="504,277,510,270" alt="point_189	7:109359714	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="503,280,509,272" alt="point_190	7:112980477	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="503,280,509,272" alt="point_191	7:118518479	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="503,281,509,273" alt="point_192	7:124015030	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="503,281,509,273" alt="point_193	7:144708411	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="503,282,509,274" alt="point_194	7:146848333	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="502,282,508,274" alt="point_195	7:149707006	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="502,283,508,275" alt="point_196	7:158466432	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="502,284,508,276" alt="point_197	8:10935898	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="502,286,508,278" alt="point_198	8:24807520	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="502,286,508,278" alt="point_199	8:24809636	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="501,287,507,279" alt="point_200	8:37147349	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="501,287,507,279" alt="point_201	8:40360196	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="501,287,507,279" alt="point_202	8:49941703	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="501,287,507,280" alt="point_203	8:71658951	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="501,288,507,280" alt="point_204	8:77510348	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="500,291,506,283" alt="point_205	8:78817219	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="500,291,506,284" alt="point_206	8:80277213	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="500,292,506,284" alt="point_207	8:84781808	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="500,293,506,285" alt="point_208	8:96234759	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="500,294,506,286" alt="point_209	8:104138970	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="499,296,505,288" alt="point_210	8:117634425	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="499,296,505,288" alt="point_211	8:122032732	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="499,296,505,288" alt="point_212	8:122468073	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="499,296,505,288" alt="point_213	8:131640155	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="499,296,505,288" alt="point_214	8:139926589	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="498,296,504,288" alt="point_215	9:16787786	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="498,296,504,288" alt="point_216	9:19161456	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="498,296,504,288" alt="point_217	9:19330561	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="498,296,504,288" alt="point_218	9:71759542	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="498,296,504,288" alt="point_219	9:78518999	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="497,296,503,289" alt="point_220	9:97162778	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="497,296,503,289" alt="point_221	9:98449514	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="497,297,503,289" alt="point_222	9:101204352	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="497,297,503,289" alt="point_223	9:101971621	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="497,297,503,289" alt="point_224	9:111807273	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="497,297,503,289" alt="point_225	9:130586095	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="496,297,502,290" alt="point_226	9:132900076	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="496,297,502,290" alt="point_227	9:136454105	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="496,298,502,290" alt="point_228	10:3925728	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="496,298,502,290" alt="point_229	10:8454687	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="496,298,502,290" alt="point_230	10:15596732	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="496,298,502,290" alt="point_231	10:55847908	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="495,298,501,290" alt="point_232	10:57538419	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="495,298,501,291" alt="point_233	10:82434987	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="495,299,501,291" alt="point_234	10:87598700	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="495,299,501,292" alt="point_235	10:122717301	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="495,300,501,292" alt="point_236	10:134615093	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="495,300,500,292" alt="point_237	11:2776410	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="494,300,500,292" alt="point_238	11:3882730	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="494,300,500,292" alt="point_239	11:8183707	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="494,300,500,292" alt="point_240	11:10383322	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="494,300,500,292" alt="point_241	11:15605255	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="494,300,500,292" alt="point_242	11:24941083	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="494,300,499,292" alt="point_243	11:45108536	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="493,300,499,292" alt="point_244	11:47103486	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="493,300,499,292" alt="point_245	11:47171714	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="493,300,499,292" alt="point_246	11:55531292	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="493,300,499,292" alt="point_247	11:55531298	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="493,300,499,292" alt="point_248	11:65590043	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="493,300,499,292" alt="point_249	11:80769390	0.9999	0"  onClick={e => clickPoint(e)} />
          <area shape="rect" coords="492,300,498,292" alt="point_250	11:83457724	0.9999	0"  onClick={e => clickPoint(e)} />
        </map>
      </div>
    </>
  );

  function clickPoint(e) {
    console.log(e.target.alt);
    var variant = e.target.alt.split("\t");
    setDebugQuery(
      {
        "point_#": variant[0],
        "snp": variant[1],
        "p-value": variant[2],
        "nlog_p": variant[3] 
      }
    );
  }
}
