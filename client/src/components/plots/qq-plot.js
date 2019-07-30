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
      <img src="assets/images/qq-plots/ewings_sarcoma.png" alt="QQ-plot of selected trait" useMap="#image-map" />
      <map name="image-map">
        <area shape="rect" coords="739,88,749,80" href="imPoint.html" alt="Point 1"  />
        <area shape="rect" coords="666,141,676,133" href="imPoint.html" alt="Point 2"  />
        <area shape="rect" coords="631,141,641,134" href="imPoint.html" alt="Point 3"  />
        <area shape="rect" coords="609,141,619,134" href="imPoint.html" alt="Point 4"  />
        <area shape="rect" coords="592,143,602,135" href="imPoint.html" alt="Point 5"  />
        <area shape="rect" coords="579,146,589,138" href="imPoint.html" alt="Point 6"  />
        <area shape="rect" coords="568,146,578,138" href="imPoint.html" alt="Point 7"  />
        <area shape="rect" coords="558,146,568,138" href="imPoint.html" alt="Point 8"  />
        <area shape="rect" coords="550,146,560,138" href="imPoint.html" alt="Point 9"  />
        <area shape="rect" coords="542,146,552,139" href="imPoint.html" alt="Point 10"  />
        <area shape="rect" coords="536,147,546,139" href="imPoint.html" alt="Point 11"  />
        <area shape="rect" coords="529,147,539,139" href="imPoint.html" alt="Point 12"  />
        <area shape="rect" coords="524,148,534,140" href="imPoint.html" alt="Point 13"  />
        <area shape="rect" coords="519,148,529,140" href="imPoint.html" alt="Point 14"  />
        <area shape="rect" coords="514,148,524,140" href="imPoint.html" alt="Point 15"  />
        <area shape="rect" coords="510,148,520,140" href="imPoint.html" alt="Point 16"  />
        <area shape="rect" coords="505,148,515,141" href="imPoint.html" alt="Point 17"  />
        <area shape="rect" coords="501,148,511,141" href="imPoint.html" alt="Point 18"  />
        <area shape="rect" coords="498,149,508,141" href="imPoint.html" alt="Point 19"  />
        <area shape="rect" coords="494,149,504,141" href="imPoint.html" alt="Point 20"  />
        <area shape="rect" coords="491,149,501,142" href="imPoint.html" alt="Point 21"  />
        <area shape="rect" coords="488,150,498,142" href="imPoint.html" alt="Point 22"  />
        <area shape="rect" coords="485,150,495,142" href="imPoint.html" alt="Point 23"  />
        <area shape="rect" coords="482,150,492,142" href="imPoint.html" alt="Point 24"  />
        <area shape="rect" coords="479,150,489,142" href="imPoint.html" alt="Point 25"  />
        <area shape="rect" coords="476,150,486,142" href="imPoint.html" alt="Point 26"  />
        <area shape="rect" coords="474,151,484,143" href="imPoint.html" alt="Point 27"  />
        <area shape="rect" coords="471,152,481,144" href="imPoint.html" alt="Point 28"  />
        <area shape="rect" coords="469,152,479,144" href="imPoint.html" alt="Point 29"  />
        <area shape="rect" coords="467,152,477,144" href="imPoint.html" alt="Point 30"  />
        <area shape="rect" coords="464,152,474,145" href="imPoint.html" alt="Point 31"  />
        <area shape="rect" coords="462,152,472,145" href="imPoint.html" alt="Point 32"  />
        <area shape="rect" coords="460,153,470,145" href="imPoint.html" alt="Point 33"  />
        <area shape="rect" coords="458,153,468,145" href="imPoint.html" alt="Point 34"  />
        <area shape="rect" coords="456,153,466,145" href="imPoint.html" alt="Point 35"  />
        <area shape="rect" coords="454,153,464,146" href="imPoint.html" alt="Point 36"  />
        <area shape="rect" coords="452,154,462,146" href="imPoint.html" alt="Point 37"  />
        <area shape="rect" coords="450,154,460,146" href="imPoint.html" alt="Point 38"  />
        <area shape="rect" coords="449,156,459,148" href="imPoint.html" alt="Point 39"  />
        <area shape="rect" coords="447,157,457,149" href="imPoint.html" alt="Point 40"  />
        <area shape="rect" coords="445,160,455,152" href="imPoint.html" alt="Point 41"  />
        <area shape="rect" coords="444,161,454,153" href="imPoint.html" alt="Point 42"  />
        <area shape="rect" coords="442,161,452,153" href="imPoint.html" alt="Point 43"  />
        <area shape="rect" coords="441,163,451,155" href="imPoint.html" alt="Point 44"  />
        <area shape="rect" coords="439,166,449,158" href="imPoint.html" alt="Point 45"  />
        <area shape="rect" coords="438,167,448,159" href="imPoint.html" alt="Point 46"  />
        <area shape="rect" coords="436,168,446,161" href="imPoint.html" alt="Point 47"  />
        <area shape="rect" coords="435,170,445,162" href="imPoint.html" alt="Point 48"  />
        <area shape="rect" coords="433,170,443,162" href="imPoint.html" alt="Point 49"  />
        <area shape="rect" coords="432,171,442,163" href="imPoint.html" alt="Point 50"  />
        <area shape="rect" coords="431,173,441,165" href="imPoint.html" alt="Point 51"  />
        <area shape="rect" coords="429,174,439,166" href="imPoint.html" alt="Point 52"  />
        <area shape="rect" coords="428,174,438,166" href="imPoint.html" alt="Point 53"  />
        <area shape="rect" coords="427,174,437,166" href="imPoint.html" alt="Point 54"  />
        <area shape="rect" coords="425,174,435,166" href="imPoint.html" alt="Point 55"  />
        <area shape="rect" coords="424,174,434,166" href="imPoint.html" alt="Point 56"  />
        <area shape="rect" coords="423,174,433,166" href="imPoint.html" alt="Point 57"  />
        <area shape="rect" coords="422,174,432,166" href="imPoint.html" alt="Point 58"  />
        <area shape="rect" coords="421,175,431,167" href="imPoint.html" alt="Point 59"  />
        <area shape="rect" coords="420,175,430,167" href="imPoint.html" alt="Point 60"  />
        <area shape="rect" coords="419,175,429,167" href="imPoint.html" alt="Point 61"  />
        <area shape="rect" coords="417,175,427,168" href="imPoint.html" alt="Point 62"  />
        <area shape="rect" coords="416,176,426,168" href="imPoint.html" alt="Point 63"  />
        <area shape="rect" coords="415,177,425,169" href="imPoint.html" alt="Point 64"  />
        <area shape="rect" coords="414,178,424,170" href="imPoint.html" alt="Point 65"  />
        <area shape="rect" coords="413,178,423,170" href="imPoint.html" alt="Point 66"  />
        <area shape="rect" coords="412,178,422,170" href="imPoint.html" alt="Point 67"  />
        <area shape="rect" coords="411,178,421,170" href="imPoint.html" alt="Point 68"  />
        <area shape="rect" coords="410,180,420,172" href="imPoint.html" alt="Point 69"  />
        <area shape="rect" coords="409,180,419,172" href="imPoint.html" alt="Point 70"  />
        <area shape="rect" coords="408,181,418,173" href="imPoint.html" alt="Point 71"  />
        <area shape="rect" coords="407,181,417,173" href="imPoint.html" alt="Point 72"  />
        <area shape="rect" coords="406,181,416,173" href="imPoint.html" alt="Point 73"  />
        <area shape="rect" coords="406,181,416,173" href="imPoint.html" alt="Point 74"  />
        <area shape="rect" coords="405,181,415,173" href="imPoint.html" alt="Point 75"  />
        <area shape="rect" coords="404,181,414,173" href="imPoint.html" alt="Point 76"  />
        <area shape="rect" coords="403,181,413,173" href="imPoint.html" alt="Point 77"  />
        <area shape="rect" coords="402,181,412,173" href="imPoint.html" alt="Point 78"  />
        <area shape="rect" coords="401,182,411,174" href="imPoint.html" alt="Point 79"  />
        <area shape="rect" coords="400,182,410,174" href="imPoint.html" alt="Point 80"  />
        <area shape="rect" coords="399,182,409,174" href="imPoint.html" alt="Point 81"  />
        <area shape="rect" coords="399,183,409,175" href="imPoint.html" alt="Point 82"  />
        <area shape="rect" coords="398,184,408,176" href="imPoint.html" alt="Point 83"  />
        <area shape="rect" coords="397,184,407,176" href="imPoint.html" alt="Point 84"  />
        <area shape="rect" coords="396,184,406,176" href="imPoint.html" alt="Point 85"  />
        <area shape="rect" coords="395,184,405,176" href="imPoint.html" alt="Point 86"  />
        <area shape="rect" coords="395,184,405,176" href="imPoint.html" alt="Point 87"  />
        <area shape="rect" coords="394,184,404,176" href="imPoint.html" alt="Point 88"  />
        <area shape="rect" coords="393,184,403,176" href="imPoint.html" alt="Point 89"  />
        <area shape="rect" coords="392,184,402,176" href="imPoint.html" alt="Point 90"  />
        <area shape="rect" coords="392,184,402,177" href="imPoint.html" alt="Point 91"  />
        <area shape="rect" coords="391,184,401,177" href="imPoint.html" alt="Point 92"  />
        <area shape="rect" coords="390,185,400,177" href="imPoint.html" alt="Point 93"  />
        <area shape="rect" coords="389,185,399,177" href="imPoint.html" alt="Point 94"  />
        <area shape="rect" coords="389,185,399,177" href="imPoint.html" alt="Point 95"  />
        <area shape="rect" coords="388,185,398,177" href="imPoint.html" alt="Point 96"  />
        <area shape="rect" coords="387,185,397,177" href="imPoint.html" alt="Point 97"  />
        <area shape="rect" coords="387,185,397,177" href="imPoint.html" alt="Point 98"  />
        <area shape="rect" coords="386,186,396,178" href="imPoint.html" alt="Point 99"  />
        <area shape="rect" coords="385,186,395,178" href="imPoint.html" alt="Point 100"  />
        <area shape="rect" coords="385,187,395,179" href="imPoint.html" alt="Point 101"  />
        <area shape="rect" coords="384,187,394,179" href="imPoint.html" alt="Point 102"  />
        <area shape="rect" coords="383,187,393,179" href="imPoint.html" alt="Point 103"  />
        <area shape="rect" coords="383,187,393,179" href="imPoint.html" alt="Point 104"  />
        <area shape="rect" coords="382,188,392,180" href="imPoint.html" alt="Point 105"  />
        <area shape="rect" coords="381,188,391,180" href="imPoint.html" alt="Point 106"  />
        <area shape="rect" coords="381,188,391,180" href="imPoint.html" alt="Point 107"  />
        <area shape="rect" coords="380,188,390,180" href="imPoint.html" alt="Point 108"  />
        <area shape="rect" coords="379,188,389,180" href="imPoint.html" alt="Point 109"  />
        <area shape="rect" coords="379,189,389,181" href="imPoint.html" alt="Point 110"  />
        <area shape="rect" coords="378,190,388,182" href="imPoint.html" alt="Point 111"  />
        <area shape="rect" coords="378,191,388,183" href="imPoint.html" alt="Point 112"  />
        <area shape="rect" coords="377,192,387,184" href="imPoint.html" alt="Point 113"  />
        <area shape="rect" coords="376,193,386,185" href="imPoint.html" alt="Point 114"  />
        <area shape="rect" coords="376,194,386,186" href="imPoint.html" alt="Point 115"  />
        <area shape="rect" coords="375,194,385,186" href="imPoint.html" alt="Point 116"  />
        <area shape="rect" coords="375,194,385,186" href="imPoint.html" alt="Point 117"  />
        <area shape="rect" coords="374,197,384,190" href="imPoint.html" alt="Point 118"  />
        <area shape="rect" coords="374,199,384,192" href="imPoint.html" alt="Point 119"  />
        <area shape="rect" coords="373,208,383,200" href="imPoint.html" alt="Point 120"  />
        <area shape="rect" coords="372,209,382,201" href="imPoint.html" alt="Point 121"  />
        <area shape="rect" coords="372,210,382,202" href="imPoint.html" alt="Point 122"  />
        <area shape="rect" coords="371,212,381,204" href="imPoint.html" alt="Point 123"  />
        <area shape="rect" coords="371,220,381,212" href="imPoint.html" alt="Point 124"  />
        <area shape="rect" coords="370,222,380,214" href="imPoint.html" alt="Point 125"  />
        <area shape="rect" coords="370,222,380,214" href="imPoint.html" alt="Point 126"  />
        <area shape="rect" coords="369,226,379,218" href="imPoint.html" alt="Point 127"  />
        <area shape="rect" coords="369,227,379,219" href="imPoint.html" alt="Point 128"  />
        <area shape="rect" coords="368,228,378,221" href="imPoint.html" alt="Point 129"  />
        <area shape="rect" coords="368,231,378,223" href="imPoint.html" alt="Point 130"  />
        <area shape="rect" coords="367,234,377,226" href="imPoint.html" alt="Point 131"  />
        <area shape="rect" coords="367,239,377,231" href="imPoint.html" alt="Point 132"  />
        <area shape="rect" coords="366,239,376,232" href="imPoint.html" alt="Point 133"  />
        <area shape="rect" coords="366,241,376,233" href="imPoint.html" alt="Point 134"  />
        <area shape="rect" coords="365,241,375,233" href="imPoint.html" alt="Point 135"  />
        <area shape="rect" coords="365,242,375,234" href="imPoint.html" alt="Point 136"  />
        <area shape="rect" coords="364,244,374,236" href="imPoint.html" alt="Point 137"  />
        <area shape="rect" coords="364,246,374,239" href="imPoint.html" alt="Point 138"  />
        <area shape="rect" coords="363,247,373,239" href="imPoint.html" alt="Point 139"  />
        <area shape="rect" coords="363,247,373,239" href="imPoint.html" alt="Point 140"  />
        <area shape="rect" coords="362,248,372,240" href="imPoint.html" alt="Point 141"  />
        <area shape="rect" coords="362,249,372,241" href="imPoint.html" alt="Point 142"  />
        <area shape="rect" coords="361,250,371,242" href="imPoint.html" alt="Point 143"  />
        <area shape="rect" coords="361,253,371,245" href="imPoint.html" alt="Point 144"  />
        <area shape="rect" coords="360,255,370,247" href="imPoint.html" alt="Point 145"  />
        <area shape="rect" coords="360,255,370,247" href="imPoint.html" alt="Point 146"  />
        <area shape="rect" coords="359,255,369,247" href="imPoint.html" alt="Point 147"  />
        <area shape="rect" coords="359,255,369,248" href="imPoint.html" alt="Point 148"  />
        <area shape="rect" coords="359,256,369,248" href="imPoint.html" alt="Point 149"  />
        <area shape="rect" coords="358,257,368,249" href="imPoint.html" alt="Point 150"  />
        <area shape="rect" coords="358,257,368,249" href="imPoint.html" alt="Point 151"  />
        <area shape="rect" coords="357,257,367,249" href="imPoint.html" alt="Point 152"  />
        <area shape="rect" coords="357,257,367,250" href="imPoint.html" alt="Point 153"  />
        <area shape="rect" coords="356,258,366,250" href="imPoint.html" alt="Point 154"  />
        <area shape="rect" coords="356,258,366,250" href="imPoint.html" alt="Point 155"  />
        <area shape="rect" coords="355,259,365,251" href="imPoint.html" alt="Point 156"  />
        <area shape="rect" coords="355,259,365,251" href="imPoint.html" alt="Point 157"  />
        <area shape="rect" coords="355,259,365,251" href="imPoint.html" alt="Point 158"  />
        <area shape="rect" coords="354,259,364,251" href="imPoint.html" alt="Point 159"  />
        <area shape="rect" coords="354,259,364,251" href="imPoint.html" alt="Point 160"  />
        <area shape="rect" coords="353,259,363,252" href="imPoint.html" alt="Point 161"  />
        <area shape="rect" coords="353,259,363,252" href="imPoint.html" alt="Point 162"  />
        <area shape="rect" coords="353,260,363,253" href="imPoint.html" alt="Point 163"  />
        <area shape="rect" coords="352,261,362,253" href="imPoint.html" alt="Point 164"  />
        <area shape="rect" coords="352,261,362,253" href="imPoint.html" alt="Point 165"  />
        <area shape="rect" coords="351,261,361,253" href="imPoint.html" alt="Point 166"  />
        <area shape="rect" coords="351,261,361,254" href="imPoint.html" alt="Point 167"  />
        <area shape="rect" coords="350,262,360,254" href="imPoint.html" alt="Point 168"  />
        <area shape="rect" coords="350,262,360,254" href="imPoint.html" alt="Point 169"  />
        <area shape="rect" coords="350,263,360,255" href="imPoint.html" alt="Point 170"  />
        <area shape="rect" coords="349,263,359,255" href="imPoint.html" alt="Point 171"  />
        <area shape="rect" coords="349,264,359,256" href="imPoint.html" alt="Point 172"  />
        <area shape="rect" coords="349,264,359,256" href="imPoint.html" alt="Point 173"  />
        <area shape="rect" coords="348,264,358,256" href="imPoint.html" alt="Point 174"  />
        <area shape="rect" coords="348,264,358,257" href="imPoint.html" alt="Point 175"  />
        <area shape="rect" coords="347,265,357,258" href="imPoint.html" alt="Point 176"  />
        <area shape="rect" coords="347,267,357,259" href="imPoint.html" alt="Point 177"  />
        <area shape="rect" coords="347,268,357,260" href="imPoint.html" alt="Point 178"  />
        <area shape="rect" coords="346,270,356,262" href="imPoint.html" alt="Point 179"  />
        <area shape="rect" coords="346,271,356,263" href="imPoint.html" alt="Point 180"  />
        <area shape="rect" coords="345,272,355,264" href="imPoint.html" alt="Point 181"  />
        <area shape="rect" coords="345,272,355,265" href="imPoint.html" alt="Point 182"  />
        <area shape="rect" coords="345,273,355,265" href="imPoint.html" alt="Point 183"  />
        <area shape="rect" coords="344,273,354,265" href="imPoint.html" alt="Point 184"  />
        <area shape="rect" coords="344,274,354,266" href="imPoint.html" alt="Point 185"  />
        <area shape="rect" coords="344,274,354,266" href="imPoint.html" alt="Point 186"  />
        <area shape="rect" coords="343,274,353,266" href="imPoint.html" alt="Point 187"  />
        <area shape="rect" coords="343,277,353,269" href="imPoint.html" alt="Point 188"  />
        <area shape="rect" coords="343,277,353,270" href="imPoint.html" alt="Point 189"  />
        <area shape="rect" coords="342,280,352,272" href="imPoint.html" alt="Point 190"  />
        <area shape="rect" coords="342,280,352,272" href="imPoint.html" alt="Point 191"  />
        <area shape="rect" coords="342,281,352,273" href="imPoint.html" alt="Point 192"  />
        <area shape="rect" coords="341,281,351,273" href="imPoint.html" alt="Point 193"  />
        <area shape="rect" coords="341,282,351,274" href="imPoint.html" alt="Point 194"  />
        <area shape="rect" coords="340,282,350,274" href="imPoint.html" alt="Point 195"  />
        <area shape="rect" coords="340,283,350,275" href="imPoint.html" alt="Point 196"  />
        <area shape="rect" coords="340,284,350,276" href="imPoint.html" alt="Point 197"  />
        <area shape="rect" coords="339,286,349,278" href="imPoint.html" alt="Point 198"  />
        <area shape="rect" coords="339,286,349,278" href="imPoint.html" alt="Point 199"  />
        <area shape="rect" coords="339,287,349,279" href="imPoint.html" alt="Point 200"  />
        <area shape="rect" coords="338,287,348,279" href="imPoint.html" alt="Point 201"  />
        <area shape="rect" coords="338,287,348,279" href="imPoint.html" alt="Point 202"  />
        <area shape="rect" coords="338,287,348,280" href="imPoint.html" alt="Point 203"  />
        <area shape="rect" coords="337,288,347,280" href="imPoint.html" alt="Point 204"  />
        <area shape="rect" coords="337,291,347,283" href="imPoint.html" alt="Point 205"  />
        <area shape="rect" coords="337,291,347,284" href="imPoint.html" alt="Point 206"  />
        <area shape="rect" coords="336,292,346,284" href="imPoint.html" alt="Point 207"  />
        <area shape="rect" coords="336,293,346,285" href="imPoint.html" alt="Point 208"  />
        <area shape="rect" coords="336,294,346,286" href="imPoint.html" alt="Point 209"  />
        <area shape="rect" coords="336,296,346,288" href="imPoint.html" alt="Point 210"  />
        <area shape="rect" coords="335,296,345,288" href="imPoint.html" alt="Point 211"  />
        <area shape="rect" coords="335,296,345,288" href="imPoint.html" alt="Point 212"  />
        <area shape="rect" coords="335,296,345,288" href="imPoint.html" alt="Point 213"  />
        <area shape="rect" coords="334,296,344,288" href="imPoint.html" alt="Point 214"  />
        <area shape="rect" coords="334,296,344,288" href="imPoint.html" alt="Point 215"  />
        <area shape="rect" coords="334,296,344,288" href="imPoint.html" alt="Point 216"  />
        <area shape="rect" coords="333,296,343,288" href="imPoint.html" alt="Point 217"  />
        <area shape="rect" coords="333,296,343,288" href="imPoint.html" alt="Point 218"  />
        <area shape="rect" coords="333,296,343,288" href="imPoint.html" alt="Point 219"  />
        <area shape="rect" coords="332,296,342,289" href="imPoint.html" alt="Point 220"  />
        <area shape="rect" coords="332,296,342,289" href="imPoint.html" alt="Point 221"  />
        <area shape="rect" coords="332,297,342,289" href="imPoint.html" alt="Point 222"  />
        <area shape="rect" coords="332,297,342,289" href="imPoint.html" alt="Point 223"  />
        <area shape="rect" coords="331,297,341,289" href="imPoint.html" alt="Point 224"  />
        <area shape="rect" coords="331,297,341,289" href="imPoint.html" alt="Point 225"  />
        <area shape="rect" coords="331,297,341,290" href="imPoint.html" alt="Point 226"  />
        <area shape="rect" coords="330,297,340,290" href="imPoint.html" alt="Point 227"  />
        <area shape="rect" coords="330,298,340,290" href="imPoint.html" alt="Point 228"  />
        <area shape="rect" coords="330,298,340,290" href="imPoint.html" alt="Point 229"  />
        <area shape="rect" coords="329,298,339,290" href="imPoint.html" alt="Point 230"  />
        <area shape="rect" coords="329,298,339,290" href="imPoint.html" alt="Point 231"  />
        <area shape="rect" coords="329,298,339,290" href="imPoint.html" alt="Point 232"  />
        <area shape="rect" coords="329,298,339,291" href="imPoint.html" alt="Point 233"  />
        <area shape="rect" coords="328,299,338,291" href="imPoint.html" alt="Point 234"  />
        <area shape="rect" coords="328,299,338,292" href="imPoint.html" alt="Point 235"  />
        <area shape="rect" coords="328,300,338,292" href="imPoint.html" alt="Point 236"  />
        <area shape="rect" coords="327,300,337,292" href="imPoint.html" alt="Point 237"  />
        <area shape="rect" coords="327,300,337,292" href="imPoint.html" alt="Point 238"  />
        <area shape="rect" coords="327,300,337,292" href="imPoint.html" alt="Point 239"  />
        <area shape="rect" coords="327,300,337,292" href="imPoint.html" alt="Point 240"  />
        <area shape="rect" coords="326,300,336,292" href="imPoint.html" alt="Point 241"  />
        <area shape="rect" coords="326,300,336,292" href="imPoint.html" alt="Point 242"  />
        <area shape="rect" coords="326,300,336,292" href="imPoint.html" alt="Point 243"  />
        <area shape="rect" coords="325,300,335,292" href="imPoint.html" alt="Point 244"  />
        <area shape="rect" coords="325,300,335,292" href="imPoint.html" alt="Point 245"  />
        <area shape="rect" coords="325,300,335,292" href="imPoint.html" alt="Point 246"  />
        <area shape="rect" coords="325,300,335,292" href="imPoint.html" alt="Point 247"  />
        <area shape="rect" coords="324,300,334,292" href="imPoint.html" alt="Point 248"  />
        <area shape="rect" coords="324,300,334,292" href="imPoint.html" alt="Point 249"  />
        <area shape="rect" coords="324,300,334,292" href="imPoint.html" alt="Point 250"  />
      </map>
    </div>
  );

}