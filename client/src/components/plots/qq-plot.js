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
  // const [debugQuery, setDebugQuery] = useState({});
  // const [debug1, setDebug1] = useState({});
  // const [debug2, setDebug2] = useState({});
  // const [debug3, setDebug3] = useState({});
  // const [debugQQPoints, setDebugQQPoints] = useState({});

  return (
    <div className="text-center">
      <img
        src="assets/images/qq-plots/ewings_sarcoma.png"
        alt="QQ-plot of selected trait"
        useMap="#image-map"
      />
      <map name="image-map">
        <area shape="rect" coords="739,88,749,80" alt="Point 1" data="7:10786080	0.001	3" href="" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="666,141,676,133" alt="Point 2" data="7:87767329	0.001	3" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="631,141,641,134" alt="Point 3" data="12:1775043	0.001	3" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="609,141,619,134" alt="Point 4" data="18:60211100	0.001	3" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="592,143,602,135" alt="Point 5" data="2:175178895	0.0009998	3.00008686758343" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="579,146,589,138" alt="Point 6" data="8:8740471	0.0009998	3.00008686758343" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="568,146,578,138" alt="Point 7" data="15:58811252	0.0009997	3.00013030789173" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="558,146,568,138" alt="Point 8" data="13:106322899	0.0009995	3.00021720154586" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="550,146,560,138" alt="Point 9" data="7:13669973	0.0009994	3.00026065489343" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="542,146,552,139" alt="Point 10" data="17:13489143	0.0009994	3.00026065489343" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="536,147,546,139" alt="Point 11" data="9:141015019	0.0009993	3.00030411258916" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="529,147,539,139" alt="Point 12" data="18:14936965	0.0009993	3.00030411258916" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="524,148,534,140" alt="Point 13" data="2:176586888	0.0009992	3.00034757463392" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="519,148,529,140" alt="Point 14" data="2:176586869	0.0009991	3.00039104102858" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="514,148,524,140" alt="Point 15" data="7:118359335	0.0009991	3.00039104102858" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="510,148,520,140" alt="Point 16" data="2:176586851	0.000999	3.00043451177402" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="505,148,515,141" alt="Point 17" data="16:19534699	0.0009989	3.0004779868711" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="501,148,511,141" alt="Point 18" data="8:26083235	0.0009987	3.00056495012367" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="498,149,508,141" alt="Point 19" data="2:42060752	0.0009986	3.00060843828091" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="494,149,504,141" alt="Point 20" data="3:45693419	0.0009985	3.00065193079328" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="491,149,501,142" alt="Point 21" data="3:143112664	0.0009984	3.00069542766165" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="488,150,498,142" alt="Point 22" data="6:21638485	0.0009984	3.00069542766165" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="485,150,495,142" alt="Point 23" data="1:217671771	0.0009983	3.0007389288869" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="482,150,492,142" alt="Point 24" data="2:167928440	0.0009979	3.00091297737411" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="479,150,489,142" alt="Point 25" data="7:134997148	0.0009979	3.00091297737411" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="476,150,486,142" alt="Point 26" data="3:197462004	0.0009977	3.00100002778168" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="474,151,484,143" alt="Point 27" data="7:107913805	0.0009976	3.00104355952951" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="471,152,481,144" alt="Point 28" data="8:8743236	0.0009974	3.00113063611766" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="469,152,479,144" alt="Point 29" data="12:11181578	0.0009974	3.00113063611766" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="467,152,477,144" alt="Point 30" data="20:49076910	0.0009974	3.00113063611766" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="464,152,474,145" alt="Point 31" data="3:197459208	0.0009972	3.00121773016826" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="462,152,472,145" alt="Point 32" data="2:190649958	0.0009971	3.00126128374418" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="460,153,470,145" alt="Point 33" data="7:101974208	0.0009971	3.00126128374418" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="458,153,468,145" alt="Point 34" data="8:59545578	0.0009971	3.00126128374418" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="456,153,466,145" alt="Point 35" data="20:42255437	0.0009971	3.00126128374418" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="454,153,464,146" alt="Point 36" data="9:83505927	0.000997	3.00130484168834" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="452,154,462,146" alt="Point 37" data="7:80046120	0.0009964	3.00156628113553" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="450,154,460,146" alt="Point 38" data="11:121642901	0.0009957	3.00187149287173" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="449,156,459,148" alt="Point 39" data="4:130271938	0.0009953	3.0020459959306" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="447,157,457,149" alt="Point 40" data="3:88532530	0.0009952	3.00208963265326" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="445,160,455,152" alt="Point 41" data="15:28219720	0.000995	3.00217691925427" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="444,161,454,153" alt="Point 42" data="11:80080639	0.0009949	3.0022205691344" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="442,161,452,153" alt="Point 43" data="4:146546701	0.0009948	3.0022642234021" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="441,163,451,155" alt="Point 44" data="16:19612328	0.0009948	3.0022642234021" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="439,166,449,158" alt="Point 45" data="4:150310194	0.0009947	3.00230788205827" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="438,167,448,159" alt="Point 46" data="2:68322579	0.0009946	3.00235154510379" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="436,168,446,161" alt="Point 47" data="10:80582805	0.0009946	3.00235154510379" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="435,170,445,162" alt="Point 48" data="17:71622212	0.0009944	3.00243888436641" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="433,170,443,162" alt="Point 49" data="2:176567013	0.0009943	3.00248256058528" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="432,171,442,163" alt="Point 50" data="4:133695783	0.0009943	3.00248256058528" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="431,173,441,165" alt="Point 51" data="7:80044271	0.0009943	3.00248256058528" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="429,174,439,166" alt="Point 52" data="4:150312316	0.0009942	3.00252624119702" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="428,174,438,166" alt="Point 53" data="8:8749729	0.0009941	3.00256992620253" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="427,174,437,166" alt="Point 54" data="8:9702853	0.0009941	3.00256992620253" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="425,174,435,166" alt="Point 55" data="22:42863830	0.0009941	3.00256992620253" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="424,174,434,166" alt="Point 56" data="8:59557214	0.0009939	3.00265730939838" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="423,174,433,166" alt="Point 57" data="3:88721275	0.0009938	3.00270100759049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="422,174,432,166" alt="Point 58" data="6:121904870	0.0009938	3.00270100759049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="421,175,431,167" alt="Point 59" data="12:67957082	0.0009938	3.00270100759049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="420,175,430,167" alt="Point 60" data="18:14962830	0.0009937	3.0027447101799" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="419,175,429,167" alt="Point 61" data="8:28490125	0.0009936	3.0027884171675" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="417,175,427,168" alt="Point 62" data="4:123679848	0.0009932	3.00296328911747" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="416,176,426,168" alt="Point 63" data="15:93086147	0.0009931	3.00300701810929" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="415,177,425,169" alt="Point 64" data="1:165142370	0.0009928	3.00313823150933" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="414,178,424,170" alt="Point 65" data="2:46849495	0.0009921	3.00344455036663" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="413,178,423,170" alt="Point 66" data="3:67552542	0.0009917	3.00361968676659" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="412,178,422,170" alt="Point 67" data="3:88720495	0.0009917	3.00361968676659" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="411,178,421,170" alt="Point 68" data="1:20396674	0.0009916	3.00366348190422" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="410,180,420,172" alt="Point 69" data="1:165142591	0.0009916	3.00366348190422" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="409,180,419,172" alt="Point 70" data="7:68681906	0.0009916	3.00366348190422" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="408,181,418,173" alt="Point 71" data="1:31396989	0.0009912	3.00383870663199" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="407,181,417,173" alt="Point 72" data="4:95783766	0.0009911	3.00388252386271" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="406,181,416,173" alt="Point 73" data="13:73767189	0.0009911	3.00388252386271" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="406,181,416,173" alt="Point 74" data="11:121644852	0.0009908	3.0040140020862" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="405,181,415,173" alt="Point 75" data="15:31544459	0.0009908	3.0040140020862" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="404,181,414,173" alt="Point 76" data="2:167927545	0.0009905	3.00414552012543" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="403,181,413,173" alt="Point 77" data="2:190676895	0.0009905	3.00414552012543" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="402,181,412,173" alt="Point 78" data="8:19938946	0.0009902	3.00427707800453" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="401,182,411,174" alt="Point 79" data="10:54631733	0.0009901	3.00432093948838" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="400,182,410,174" alt="Point 80" data="4:150308296	0.00099	3.00436480540245" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="399,182,409,174" alt="Point 81" data="14:32643767	0.00099	3.00436480540245" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="399,183,409,175" alt="Point 82" data="18:3074301	0.0009892	3.00471589231074" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="398,184,408,176" alt="Point 83" data="20:61004807	0.0009892	3.00471589231074" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="397,184,407,176" alt="Point 84" data="20:49146109	0.0009889	3.00484762310855" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="396,184,406,176" alt="Point 85" data="22:22745971	0.0009887	3.00493546584386" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="395,184,405,176" alt="Point 86" data="10:134915611	0.0009881	3.0051991007054" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="395,184,405,176" alt="Point 87" data="20:21360528	0.0009879	3.00528701456843" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="394,184,404,176" alt="Point 88" data="2:161269546	0.0009878	3.00533097817447" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="393,184,403,176" alt="Point 89" data="13:82337252	0.0009877	3.0053749462314" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="392,184,402,176" alt="Point 90" data="4:187319127	0.0009876	3.00541891874011" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="392,184,402,177" alt="Point 91" data="8:134830950	0.0009876	3.00541891874011" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="391,184,401,177" alt="Point 92" data="18:2116509	0.0009875	3.0054628957015" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="390,185,400,177" alt="Point 93" data="3:115964400	0.0009874	3.00550687711649" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="389,185,399,177" alt="Point 94" data="6:163074851	0.0009871	3.005638848092" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="389,185,399,177" alt="Point 95" data="8:117924653	0.0009871	3.005638848092" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="388,185,398,177" alt="Point 96" data="1:159785370	0.000987	3.00568284733036" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="387,185,397,177" alt="Point 97" data="4:188412397	0.0009868	3.0057708591823" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="387,185,397,177" alt="Point 98" data="15:28225348	0.0009868	3.0057708591823" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="386,186,396,178" alt="Point 99" data="2:121719537	0.0009867	3.00581487179768" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="385,186,395,178" alt="Point 100" data="18:34157493	0.0009867	3.00581487179768" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="385,187,395,179" alt="Point 101" data="9:84039588	0.0009865	3.00590291041179" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="384,187,394,179" alt="Point 102" data="2:32337872	0.0009863	3.00599096687639" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="383,187,393,179" alt="Point 103" data="15:22766685	0.0009863	3.00599096687639" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="383,187,393,179" alt="Point 104" data="9:83471863	0.0009859	3.00616713338601" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="382,188,392,180" alt="Point 105" data="4:61372766	0.0009858	3.00621118618129" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="381,188,391,180" alt="Point 106" data="1:99722190	0.0009855	3.00634337138454" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="381,188,391,180" alt="Point 107" data="10:43011429	0.0009854	3.00638744206111" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="380,188,390,180" alt="Point 108" data="12:75107893	0.0009854	3.00638744206111" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="379,188,389,180" alt="Point 109" data="1:241946766	0.0009852	3.00647559683293" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="379,189,389,181" alt="Point 110" data="22:22761413	0.000985	3.00656376950239" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="378,190,388,182" alt="Point 111" data="2:81041133	0.0009849	3.006607862551" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="378,191,388,183" alt="Point 112" data="4:188411375	0.0009848	3.00665196007674" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="377,192,387,184" alt="Point 113" data="22:22904065	0.0009846	3.00674016856326" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="376,193,386,185" alt="Point 114" data="4:154951150	0.0009844	3.00682839496924" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="376,194,386,186" alt="Point 115" data="11:107811054	0.0009844	3.00682839496924" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="375,194,385,186" alt="Point 116" data="4:133700336	0.000984	3.00700490156866" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="375,194,385,186" alt="Point 117" data="2:202993163	0.0009839	3.00704903942955" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="374,197,384,190" alt="Point 118" data="22:22905786	0.0009839	3.00704903942955" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="374,199,384,192" alt="Point 119" data="4:188411234	0.0009838	3.00709318177669" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="373,208,383,200" alt="Point 120" data="11:81254919	0.0009838	3.00709318177669" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="372,209,382,201" alt="Point 121" data="3:58069697	0.0009837	3.00713732861097" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="372,210,382,202" alt="Point 122" data="1:105761912	0.0009836	3.00718147993332" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="371,212,381,204" alt="Point 123" data="4:150309753	0.0009836	3.00718147993332" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="371,220,381,212" alt="Point 124" data="7:152251159	0.0009835	3.00722563574464" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="370,222,380,214" alt="Point 125" data="12:72546465	0.0009835	3.00722563574464" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="370,222,380,214" alt="Point 126" data="18:3073108	0.0009835	3.00722563574464" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="369,226,379,218" alt="Point 127" data="7:87763101	0.0009834	3.00726979604586" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="369,227,379,219" alt="Point 128" data="21:19874753	0.0009833	3.00731396083787" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="368,228,378,221" alt="Point 129" data="21:19875672	0.0009832	3.0073581301216" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="368,231,378,223" alt="Point 130" data="21:19876488	0.0009831	3.00740230389796" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="367,234,377,226" alt="Point 131" data="1:120826816	0.000983	3.00744648216786" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="367,239,377,231" alt="Point 132" data="2:81073466	0.0009825	3.00766744095254" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="366,239,376,232" alt="Point 133" data="7:80038944	0.0009822	3.00780007020442" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="366,241,376,233" alt="Point 134" data="8:8755998	0.0009822	3.00780007020442" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="365,241,375,233" alt="Point 135" data="2:239121733	0.0009819	3.00793273997233" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="365,242,375,234" alt="Point 136" data="6:1341652	0.0009819	3.00793273997233" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="364,244,374,236" alt="Point 137" data="1:105817719	0.0009818	3.00797697223615" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="364,246,374,239" alt="Point 138" data="3:197455690	0.0009818	3.00797697223615" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="363,247,373,239" alt="Point 139" data="4:133700118	0.0009818	3.00797697223615" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="363,247,373,239" alt="Point 140" data="4:133700112	0.0009817	3.00802120900542" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="362,248,372,240" alt="Point 141" data="3:77303591	0.0009816	3.00806545028105" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="362,249,372,241" alt="Point 142" data="22:42863325	0.0009815	3.00810969606398" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="361,250,371,242" alt="Point 143" data="3:115440430	0.0009814	3.0081539463551" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="361,253,371,245" alt="Point 144" data="4:187270966	0.0009814	3.0081539463551" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="360,255,370,247" alt="Point 145" data="11:4715803	0.0009813	3.00819820115536" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="360,255,370,247" alt="Point 146" data="12:5393329	0.0009813	3.00819820115536" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="359,255,369,247" alt="Point 147" data="4:133694117	0.0009812	3.00824246046565" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="359,255,369,248" alt="Point 148" data="17:13675618	0.0009811	3.00828672428691" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="359,256,369,248" alt="Point 149" data="8:28492086	0.000981	3.00833099262005" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="358,257,368,249" alt="Point 150" data="10:80581481	0.0009809	3.00837526546599" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="358,257,368,249" alt="Point 151" data="9:22339144	0.0009808	3.00841954282566" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="357,257,367,249" alt="Point 152" data="19:49274975	0.0009808	3.00841954282566" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="357,257,367,250" alt="Point 153" data="9:90458309	0.0009806	3.00850811108984" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="356,258,366,250" alt="Point 154" data="14:45236573	0.0009805	3.0085524019962" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="356,258,366,250" alt="Point 155" data="16:59853673	0.0009804	3.00859669741996" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="355,259,365,251" alt="Point 156" data="20:49146181	0.0009803	3.00864099736205" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="355,259,365,251" alt="Point 157" data="9:120734483	0.0009802	3.00868530182339" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="355,259,365,251" alt="Point 158" data="9:120734485	0.0009802	3.00868530182339" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="354,259,364,251" alt="Point 159" data="20:42207241	0.00098	3.00877392430751" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="354,259,364,251" alt="Point 160" data="8:117927351	0.0009799	3.00881824233213" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="353,259,363,252" alt="Point 161" data="1:24423268	0.0009798	3.00886256487969" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="353,259,363,252" alt="Point 162" data="3:67550804	0.0009797	3.00890689195111" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="353,260,363,253" alt="Point 163" data="12:11195162	0.0009796	3.00895122354732" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="352,261,362,253" alt="Point 164" data="2:161228333	0.0009794	3.0090399003178" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="352,261,362,253" alt="Point 165" data="12:67957144	0.0009794	3.0090399003178" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="351,261,361,253" alt="Point 166" data="1:156489543	0.0009793	3.00908424549392" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="351,261,361,254" alt="Point 167" data="1:77133555	0.0009792	3.00912859519851" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="350,262,360,254" alt="Point 168" data="6:32494061	0.0009791	3.00917294943252" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="350,262,360,254" alt="Point 169" data="1:7325255	0.0009788	3.00930603932025" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="350,263,360,255" alt="Point 170" data="9:78280911	0.0009787	3.00935041168115" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="349,263,359,255" alt="Point 171" data="2:176563177	0.0009786	3.00939478857608" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="349,264,359,256" alt="Point 172" data="22:22978197	0.0009777	3.00979438481519" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="349,264,359,256" alt="Point 173" data="5:154487974	0.0009775	3.0098832339321" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="348,264,358,256" alt="Point 174" data="16:19566083	0.0009775	3.0098832339321" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="348,264,358,257" alt="Point 175" data="20:49164026	0.0009775	3.0098832339321" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="347,265,357,258" alt="Point 176" data="7:87768059	0.0009772	3.0100165416986" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="347,267,357,259" alt="Point 177" data="7:142492930	0.0009772	3.0100165416986" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="347,268,357,260" alt="Point 178" data="1:7588862	0.0009771	3.01006098671546" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="346,270,356,262" alt="Point 179" data="10:97118471	0.0009771	3.01006098671546" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="346,271,356,263" alt="Point 180" data="9:93573542	0.0009768	3.01019434906317" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="345,272,355,264" alt="Point 181" data="22:22910416	0.0009765	3.01032775237613" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="345,272,355,265" alt="Point 182" data="20:49089761	0.0009762	3.0104611966795" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="345,273,355,265" alt="Point 183" data="7:47738225	0.0009759	3.01059468199848" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="344,273,354,265" alt="Point 184" data="6:157040592	0.0009757	3.01068369501005" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="344,274,354,266" alt="Point 185" data="18:70754766	0.0009754	3.01081724874445" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="344,274,354,266" alt="Point 186" data="2:221709623	0.0009753	3.01086177578421" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="343,274,353,266" alt="Point 187" data="3:88522796	0.0009753	3.01086177578421" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="343,277,353,269" alt="Point 188" data="20:21346441	0.0009752	3.01090630738967" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="343,277,353,270" alt="Point 189" data="8:28492404	0.000975	3.01099538430146" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="342,280,352,272" alt="Point 190" data="18:15090745	0.0009749	3.01103992960966" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="342,280,352,272" alt="Point 191" data="4:92642428	0.0009746	3.01117359295472" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="342,281,352,273" alt="Point 192" data="8:70617675	0.0009744	3.0112627247112" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="341,281,351,273" alt="Point 193" data="6:21646239	0.0009741	3.01139645665434" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="341,282,351,274" alt="Point 194" data="10:100345525	0.0009739	3.01148563416633" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="340,282,350,274" alt="Point 195" data="18:14937620	0.0009738	3.01153022979012" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="340,283,350,275" alt="Point 196" data="12:10826551	0.0009736	3.01161943477799" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="340,284,350,276" alt="Point 197" data="3:146627613	0.0009735	3.01166404414395" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="339,286,349,278" alt="Point 198" data="4:150290665	0.0009734	3.01170865809251" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="339,286,349,278" alt="Point 199" data="13:28371586	0.0009732	3.01179789974122" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="339,287,349,279" alt="Point 200" data="7:7298243	0.000973	3.01188715973165" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="338,287,348,279" alt="Point 201" data="3:88505911	0.0009727	3.01202108412452" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="338,287,348,279" alt="Point 202" data="7:10815994	0.0009727	3.01202108412452" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="338,287,348,280" alt="Point 203" data="2:9988129	0.0009726	3.01206573476784" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="337,288,347,280" alt="Point 204" data="3:71668961	0.0009725	3.01211039000225" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="337,291,347,283" alt="Point 205" data="4:118819215	0.0009725	3.01211039000225" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="337,291,347,284" alt="Point 206" data="12:75108308	0.0009725	3.01211039000225" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="336,292,346,284" alt="Point 207" data="1:120831559	0.0009724	3.0121550498287" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="336,293,346,285" alt="Point 208" data="1:10437778	0.0009723	3.01219971424813" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="336,294,346,286" alt="Point 209" data="1:10437804	0.0009723	3.01219971424813" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="336,296,346,288" alt="Point 210" data="3:167849454	0.0009723	3.01219971424813" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="335,296,345,288" alt="Point 211" data="10:80473233	0.0009723	3.01219971424813" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="335,296,345,288" alt="Point 212" data="1:90821665	0.0009722	3.01224438326148" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="335,296,345,288" alt="Point 213" data="8:117927232	0.0009722	3.01224438326148" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="334,296,344,288" alt="Point 214" data="1:118133002	0.0009721	3.01228905686969" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="334,296,344,288" alt="Point 215" data="2:12600840	0.0009718	3.01242310527301" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="334,296,344,288" alt="Point 216" data="10:97166612	0.0009715	3.0125571950642" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="333,296,343,288" alt="Point 217" data="4:133696164	0.0009714	3.01260190086298" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="333,296,343,288" alt="Point 218" data="2:190699958	0.000971	3.012780770092" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="333,296,343,288" alt="Point 219" data="5:24117360	0.000971	3.012780770092" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="332,296,342,289" alt="Point 220" data="3:197452538	0.0009709	3.01282549891246" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="332,296,342,289" alt="Point 221" data="20:21788325	0.0009709	3.01282549891246" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="332,297,342,289" alt="Point 222" data="21:26939257	0.0009708	3.0128702323401" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="332,297,342,289" alt="Point 223" data="2:151819700	0.0009707	3.01291497037588" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="331,297,341,289" alt="Point 224" data="2:151819756	0.0009707	3.01291497037588" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="331,297,341,289" alt="Point 225" data="22:18828079	0.0009707	3.01291497037588" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="331,297,341,290" alt="Point 226" data="11:74861416	0.0009703	3.01309396861928" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="330,297,340,290" alt="Point 227" data="11:107806365	0.0009699	3.01327304066878" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="330,298,340,290" alt="Point 228" data="4:188812951	0.0009698	3.01331782022049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="330,298,340,290" alt="Point 229" data="16:3138162	0.0009698	3.01331782022049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="329,298,339,290" alt="Point 230" data="20:16457846	0.0009698	3.01331782022049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="329,298,339,290" alt="Point 231" data="20:16457847	0.0009698	3.01331782022049" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="329,298,339,290" alt="Point 232" data="13:28670578	0.0009696	3.01340739317779" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="329,298,339,291" alt="Point 233" data="9:6479531	0.0009694	3.01349698461326" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="328,299,338,291" alt="Point 234" data="3:88521973	0.0009692	3.01358659453453" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="328,299,338,292" alt="Point 235" data="10:100345691	0.000969	3.01367622294923" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="328,300,338,292" alt="Point 236" data="8:59544413	0.0009687	3.01381070026318" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="327,300,337,292" alt="Point 237" data="12:66322322	0.0009686	3.01385553528948" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="327,300,337,292" alt="Point 238" data="17:7566133	0.0009685	3.01390037494487" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="327,300,337,292" alt="Point 239" data="2:151819530	0.0009682	3.01403492169513" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="327,300,337,292" alt="Point 240" data="5:179836741	0.0009681	3.01407977987643" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="326,300,336,292" alt="Point 241" data="20:51344911	0.0009678	3.0142143822274" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="326,300,336,292" alt="Point 242" data="3:94162942	0.0009675	3.01434902630905" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="326,300,336,292" alt="Point 243" data="2:167927861	0.0009672	3.01448371214728" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="325,300,335,292" alt="Point 244" data="9:23899121	0.0009671	3.01452861671041" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="325,300,335,292" alt="Point 245" data="18:48817141	0.0009671	3.01452861671041" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="325,300,335,292" alt="Point 246" data="5:24129460	0.000967	3.014573525917" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="325,300,335,292" alt="Point 247" data="9:93573350	0.0009669	3.014618439768" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="324,300,334,292" alt="Point 248" data="12:75108730	0.0009669	3.014618439768" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="324,300,334,292" alt="Point 249" data="2:32337166	0.0009668	3.01466335826439" onClick={e => clickPoint(e)} />
        <area shape="rect" coords="324,300,334,292" alt="Point 250" data="2:32343673	0.0009666	3.01475320919714" onClick={e => clickPoint(e)} />
      </map>
    </div>
  );

  function clickPoint(e) {
    let { target: { value } } = e; 
    console.log(value);

  }
}
