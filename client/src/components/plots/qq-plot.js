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
        <area shape="rect" coords="741,88,747,80" href="imPoint.html" alt="Point 1"  />
        <area shape="rect" coords="697,141,703,133" href="imPoint.html" alt="Point 2"  />
        <area shape="rect" coords="677,141,683,134" href="imPoint.html" alt="Point 3"  />
        <area shape="rect" coords="663,141,669,134" href="imPoint.html" alt="Point 4"  />
        <area shape="rect" coords="653,143,659,135" href="imPoint.html" alt="Point 5"  />
        <area shape="rect" coords="645,146,651,138" href="imPoint.html" alt="Point 6"  />
        <area shape="rect" coords="638,146,644,138" href="imPoint.html" alt="Point 7"  />
        <area shape="rect" coords="633,146,639,138" href="imPoint.html" alt="Point 8"  />
        <area shape="rect" coords="628,146,634,138" href="imPoint.html" alt="Point 9"  />
        <area shape="rect" coords="623,146,629,139" href="imPoint.html" alt="Point 10"  />
        <area shape="rect" coords="619,147,625,139" href="imPoint.html" alt="Point 11"  />
        <area shape="rect" coords="615,147,621,139" href="imPoint.html" alt="Point 12"  />
        <area shape="rect" coords="612,148,618,140" href="imPoint.html" alt="Point 13"  />
        <area shape="rect" coords="609,148,615,140" href="imPoint.html" alt="Point 14"  />
        <area shape="rect" coords="606,148,612,140" href="imPoint.html" alt="Point 15"  />
        <area shape="rect" coords="604,148,610,140" href="imPoint.html" alt="Point 16"  />
        <area shape="rect" coords="601,148,607,141" href="imPoint.html" alt="Point 17"  />
        <area shape="rect" coords="599,148,605,141" href="imPoint.html" alt="Point 18"  />
        <area shape="rect" coords="596,149,602,141" href="imPoint.html" alt="Point 19"  />
        <area shape="rect" coords="594,149,600,141" href="imPoint.html" alt="Point 20"  />
        <area shape="rect" coords="592,149,598,142" href="imPoint.html" alt="Point 21"  />
        <area shape="rect" coords="590,150,596,142" href="imPoint.html" alt="Point 22"  />
        <area shape="rect" coords="589,150,595,142" href="imPoint.html" alt="Point 23"  />
        <area shape="rect" coords="587,150,593,142" href="imPoint.html" alt="Point 24"  />
        <area shape="rect" coords="585,150,591,142" href="imPoint.html" alt="Point 25"  />
        <area shape="rect" coords="584,150,590,142" href="imPoint.html" alt="Point 26"  />
        <area shape="rect" coords="582,151,588,143" href="imPoint.html" alt="Point 27"  />
        <area shape="rect" coords="581,152,587,144" href="imPoint.html" alt="Point 28"  />
        <area shape="rect" coords="579,152,585,144" href="imPoint.html" alt="Point 29"  />
        <area shape="rect" coords="578,152,584,144" href="imPoint.html" alt="Point 30"  />
        <area shape="rect" coords="576,152,582,145" href="imPoint.html" alt="Point 31"  />
        <area shape="rect" coords="575,152,581,145" href="imPoint.html" alt="Point 32"  />
        <area shape="rect" coords="574,153,580,145" href="imPoint.html" alt="Point 33"  />
        <area shape="rect" coords="573,153,579,145" href="imPoint.html" alt="Point 34"  />
        <area shape="rect" coords="572,153,578,145" href="imPoint.html" alt="Point 35"  />
        <area shape="rect" coords="570,153,576,146" href="imPoint.html" alt="Point 36"  />
        <area shape="rect" coords="569,154,575,146" href="imPoint.html" alt="Point 37"  />
        <area shape="rect" coords="568,154,574,146" href="imPoint.html" alt="Point 38"  />
        <area shape="rect" coords="567,156,573,148" href="imPoint.html" alt="Point 39"  />
        <area shape="rect" coords="566,157,572,149" href="imPoint.html" alt="Point 40"  />
        <area shape="rect" coords="565,160,571,152" href="imPoint.html" alt="Point 41"  />
        <area shape="rect" coords="564,161,570,153" href="imPoint.html" alt="Point 42"  />
        <area shape="rect" coords="563,161,569,153" href="imPoint.html" alt="Point 43"  />
        <area shape="rect" coords="562,163,568,155" href="imPoint.html" alt="Point 44"  />
        <area shape="rect" coords="561,166,567,158" href="imPoint.html" alt="Point 45"  />
        <area shape="rect" coords="560,167,566,159" href="imPoint.html" alt="Point 46"  />
        <area shape="rect" coords="560,168,566,161" href="imPoint.html" alt="Point 47"  />
        <area shape="rect" coords="559,170,565,162" href="imPoint.html" alt="Point 48"  />
        <area shape="rect" coords="558,170,564,162" href="imPoint.html" alt="Point 49"  />
        <area shape="rect" coords="557,171,563,163" href="imPoint.html" alt="Point 50"  />
        <area shape="rect" coords="556,173,562,165" href="imPoint.html" alt="Point 51"  />
        <area shape="rect" coords="555,174,561,166" href="imPoint.html" alt="Point 52"  />
        <area shape="rect" coords="555,174,561,166" href="imPoint.html" alt="Point 53"  />
        <area shape="rect" coords="554,174,560,166" href="imPoint.html" alt="Point 54"  />
        <area shape="rect" coords="553,174,559,166" href="imPoint.html" alt="Point 55"  />
        <area shape="rect" coords="553,174,558,166" href="imPoint.html" alt="Point 56"  />
        <area shape="rect" coords="552,174,558,166" href="imPoint.html" alt="Point 57"  />
        <area shape="rect" coords="551,174,557,166" href="imPoint.html" alt="Point 58"  />
        <area shape="rect" coords="550,175,556,167" href="imPoint.html" alt="Point 59"  />
        <area shape="rect" coords="550,175,556,167" href="imPoint.html" alt="Point 60"  />
        <area shape="rect" coords="549,175,555,167" href="imPoint.html" alt="Point 61"  />
        <area shape="rect" coords="548,175,554,168" href="imPoint.html" alt="Point 62"  />
        <area shape="rect" coords="548,176,554,168" href="imPoint.html" alt="Point 63"  />
        <area shape="rect" coords="547,177,553,169" href="imPoint.html" alt="Point 64"  />
        <area shape="rect" coords="546,178,552,170" href="imPoint.html" alt="Point 65"  />
        <area shape="rect" coords="546,178,552,170" href="imPoint.html" alt="Point 66"  />
        <area shape="rect" coords="545,178,551,170" href="imPoint.html" alt="Point 67"  />
        <area shape="rect" coords="545,178,551,170" href="imPoint.html" alt="Point 68"  />
        <area shape="rect" coords="544,180,550,172" href="imPoint.html" alt="Point 69"  />
        <area shape="rect" coords="544,180,549,172" href="imPoint.html" alt="Point 70"  />
        <area shape="rect" coords="543,181,549,173" href="imPoint.html" alt="Point 71"  />
        <area shape="rect" coords="542,181,548,173" href="imPoint.html" alt="Point 72"  />
        <area shape="rect" coords="542,181,548,173" href="imPoint.html" alt="Point 73"  />
        <area shape="rect" coords="541,181,547,173" href="imPoint.html" alt="Point 74"  />
        <area shape="rect" coords="541,181,547,173" href="imPoint.html" alt="Point 75"  />
        <area shape="rect" coords="540,181,546,173" href="imPoint.html" alt="Point 76"  />
        <area shape="rect" coords="540,181,546,173" href="imPoint.html" alt="Point 77"  />
        <area shape="rect" coords="539,181,545,173" href="imPoint.html" alt="Point 78"  />
        <area shape="rect" coords="539,182,545,174" href="imPoint.html" alt="Point 79"  />
        <area shape="rect" coords="538,182,544,174" href="imPoint.html" alt="Point 80"  />
        <area shape="rect" coords="538,182,544,174" href="imPoint.html" alt="Point 81"  />
        <area shape="rect" coords="537,183,543,175" href="imPoint.html" alt="Point 82"  />
        <area shape="rect" coords="537,184,543,176" href="imPoint.html" alt="Point 83"  />
        <area shape="rect" coords="536,184,542,176" href="imPoint.html" alt="Point 84"  />
        <area shape="rect" coords="536,184,542,176" href="imPoint.html" alt="Point 85"  />
        <area shape="rect" coords="535,184,541,176" href="imPoint.html" alt="Point 86"  />
        <area shape="rect" coords="535,184,541,176" href="imPoint.html" alt="Point 87"  />
        <area shape="rect" coords="534,184,540,176" href="imPoint.html" alt="Point 88"  />
        <area shape="rect" coords="534,184,540,176" href="imPoint.html" alt="Point 89"  />
        <area shape="rect" coords="533,184,539,176" href="imPoint.html" alt="Point 90"  />
        <area shape="rect" coords="533,184,539,177" href="imPoint.html" alt="Point 91"  />
        <area shape="rect" coords="533,184,538,177" href="imPoint.html" alt="Point 92"  />
        <area shape="rect" coords="532,185,538,177" href="imPoint.html" alt="Point 93"  />
        <area shape="rect" coords="532,185,538,177" href="imPoint.html" alt="Point 94"  />
        <area shape="rect" coords="531,185,537,177" href="imPoint.html" alt="Point 95"  />
        <area shape="rect" coords="531,185,537,177" href="imPoint.html" alt="Point 96"  />
        <area shape="rect" coords="530,185,536,177" href="imPoint.html" alt="Point 97"  />
        <area shape="rect" coords="530,185,536,177" href="imPoint.html" alt="Point 98"  />
        <area shape="rect" coords="530,186,536,178" href="imPoint.html" alt="Point 99"  />
        <area shape="rect" coords="529,186,535,178" href="imPoint.html" alt="Point 100"  />
        <area shape="rect" coords="529,187,535,179" href="imPoint.html" alt="Point 101"  />
        <area shape="rect" coords="528,187,534,179" href="imPoint.html" alt="Point 102"  />
        <area shape="rect" coords="528,187,534,179" href="imPoint.html" alt="Point 103"  />
        <area shape="rect" coords="528,187,534,179" href="imPoint.html" alt="Point 104"  />
        <area shape="rect" coords="527,188,533,180" href="imPoint.html" alt="Point 105"  />
        <area shape="rect" coords="527,188,533,180" href="imPoint.html" alt="Point 106"  />
        <area shape="rect" coords="526,188,532,180" href="imPoint.html" alt="Point 107"  />
        <area shape="rect" coords="526,188,532,180" href="imPoint.html" alt="Point 108"  />
        <area shape="rect" coords="526,188,532,180" href="imPoint.html" alt="Point 109"  />
        <area shape="rect" coords="525,189,531,181" href="imPoint.html" alt="Point 110"  />
        <area shape="rect" coords="525,190,531,182" href="imPoint.html" alt="Point 111"  />
        <area shape="rect" coords="525,191,531,183" href="imPoint.html" alt="Point 112"  />
        <area shape="rect" coords="524,192,530,184" href="imPoint.html" alt="Point 113"  />
        <area shape="rect" coords="524,193,530,185" href="imPoint.html" alt="Point 114"  />
        <area shape="rect" coords="524,194,530,186" href="imPoint.html" alt="Point 115"  />
        <area shape="rect" coords="523,194,529,186" href="imPoint.html" alt="Point 116"  />
        <area shape="rect" coords="523,194,529,186" href="imPoint.html" alt="Point 117"  />
        <area shape="rect" coords="522,197,528,190" href="imPoint.html" alt="Point 118"  />
        <area shape="rect" coords="522,199,528,192" href="imPoint.html" alt="Point 119"  />
        <area shape="rect" coords="522,208,528,200" href="imPoint.html" alt="Point 120"  />
        <area shape="rect" coords="521,209,527,201" href="imPoint.html" alt="Point 121"  />
        <area shape="rect" coords="521,210,527,202" href="imPoint.html" alt="Point 122"  />
        <area shape="rect" coords="521,212,527,204" href="imPoint.html" alt="Point 123"  />
        <area shape="rect" coords="521,220,526,212" href="imPoint.html" alt="Point 124"  />
        <area shape="rect" coords="520,222,526,214" href="imPoint.html" alt="Point 125"  />
        <area shape="rect" coords="520,222,526,214" href="imPoint.html" alt="Point 126"  />
        <area shape="rect" coords="520,226,526,218" href="imPoint.html" alt="Point 127"  />
        <area shape="rect" coords="519,227,525,219" href="imPoint.html" alt="Point 128"  />
        <area shape="rect" coords="519,228,525,221" href="imPoint.html" alt="Point 129"  />
        <area shape="rect" coords="519,231,525,223" href="imPoint.html" alt="Point 130"  />
        <area shape="rect" coords="518,234,524,226" href="imPoint.html" alt="Point 131"  />
        <area shape="rect" coords="518,239,524,231" href="imPoint.html" alt="Point 132"  />
        <area shape="rect" coords="518,239,524,232" href="imPoint.html" alt="Point 133"  />
        <area shape="rect" coords="517,241,523,233" href="imPoint.html" alt="Point 134"  />
        <area shape="rect" coords="517,241,523,233" href="imPoint.html" alt="Point 135"  />
        <area shape="rect" coords="517,242,523,234" href="imPoint.html" alt="Point 136"  />
        <area shape="rect" coords="516,244,522,236" href="imPoint.html" alt="Point 137"  />
        <area shape="rect" coords="516,246,522,239" href="imPoint.html" alt="Point 138"  />
        <area shape="rect" coords="516,247,522,239" href="imPoint.html" alt="Point 139"  />
        <area shape="rect" coords="516,247,522,239" href="imPoint.html" alt="Point 140"  />
        <area shape="rect" coords="515,248,521,240" href="imPoint.html" alt="Point 141"  />
        <area shape="rect" coords="515,249,521,241" href="imPoint.html" alt="Point 142"  />
        <area shape="rect" coords="515,250,521,242" href="imPoint.html" alt="Point 143"  />
        <area shape="rect" coords="514,253,520,245" href="imPoint.html" alt="Point 144"  />
        <area shape="rect" coords="514,255,520,247" href="imPoint.html" alt="Point 145"  />
        <area shape="rect" coords="514,255,520,247" href="imPoint.html" alt="Point 146"  />
        <area shape="rect" coords="514,255,520,247" href="imPoint.html" alt="Point 147"  />
        <area shape="rect" coords="513,255,519,248" href="imPoint.html" alt="Point 148"  />
        <area shape="rect" coords="513,256,519,248" href="imPoint.html" alt="Point 149"  />
        <area shape="rect" coords="513,257,519,249" href="imPoint.html" alt="Point 150"  />
        <area shape="rect" coords="513,257,519,249" href="imPoint.html" alt="Point 151"  />
        <area shape="rect" coords="512,257,518,249" href="imPoint.html" alt="Point 152"  />
        <area shape="rect" coords="512,257,518,250" href="imPoint.html" alt="Point 153"  />
        <area shape="rect" coords="512,258,518,250" href="imPoint.html" alt="Point 154"  />
        <area shape="rect" coords="512,258,518,250" href="imPoint.html" alt="Point 155"  />
        <area shape="rect" coords="511,259,517,251" href="imPoint.html" alt="Point 156"  />
        <area shape="rect" coords="511,259,517,251" href="imPoint.html" alt="Point 157"  />
        <area shape="rect" coords="511,259,517,251" href="imPoint.html" alt="Point 158"  />
        <area shape="rect" coords="511,259,517,251" href="imPoint.html" alt="Point 159"  />
        <area shape="rect" coords="510,259,516,251" href="imPoint.html" alt="Point 160"  />
        <area shape="rect" coords="510,259,516,252" href="imPoint.html" alt="Point 161"  />
        <area shape="rect" coords="510,259,516,252" href="imPoint.html" alt="Point 162"  />
        <area shape="rect" coords="510,260,516,253" href="imPoint.html" alt="Point 163"  />
        <area shape="rect" coords="509,261,515,253" href="imPoint.html" alt="Point 164"  />
        <area shape="rect" coords="509,261,515,253" href="imPoint.html" alt="Point 165"  />
        <area shape="rect" coords="509,261,515,253" href="imPoint.html" alt="Point 166"  />
        <area shape="rect" coords="509,261,515,254" href="imPoint.html" alt="Point 167"  />
        <area shape="rect" coords="508,262,514,254" href="imPoint.html" alt="Point 168"  />
        <area shape="rect" coords="508,262,514,254" href="imPoint.html" alt="Point 169"  />
        <area shape="rect" coords="508,263,514,255" href="imPoint.html" alt="Point 170"  />
        <area shape="rect" coords="508,263,514,255" href="imPoint.html" alt="Point 171"  />
        <area shape="rect" coords="507,264,513,256" href="imPoint.html" alt="Point 172"  />
        <area shape="rect" coords="507,264,513,256" href="imPoint.html" alt="Point 173"  />
        <area shape="rect" coords="507,264,513,256" href="imPoint.html" alt="Point 174"  />
        <area shape="rect" coords="507,264,513,257" href="imPoint.html" alt="Point 175"  />
        <area shape="rect" coords="506,265,512,258" href="imPoint.html" alt="Point 176"  />
        <area shape="rect" coords="506,267,512,259" href="imPoint.html" alt="Point 177"  />
        <area shape="rect" coords="506,268,512,260" href="imPoint.html" alt="Point 178"  />
        <area shape="rect" coords="506,270,512,262" href="imPoint.html" alt="Point 179"  />
        <area shape="rect" coords="506,271,512,263" href="imPoint.html" alt="Point 180"  />
        <area shape="rect" coords="505,272,511,264" href="imPoint.html" alt="Point 181"  />
        <area shape="rect" coords="505,272,511,265" href="imPoint.html" alt="Point 182"  />
        <area shape="rect" coords="505,273,511,265" href="imPoint.html" alt="Point 183"  />
        <area shape="rect" coords="505,273,511,265" href="imPoint.html" alt="Point 184"  />
        <area shape="rect" coords="504,274,510,266" href="imPoint.html" alt="Point 185"  />
        <area shape="rect" coords="504,274,510,266" href="imPoint.html" alt="Point 186"  />
        <area shape="rect" coords="504,274,510,266" href="imPoint.html" alt="Point 187"  />
        <area shape="rect" coords="504,277,510,269" href="imPoint.html" alt="Point 188"  />
        <area shape="rect" coords="504,277,510,270" href="imPoint.html" alt="Point 189"  />
        <area shape="rect" coords="503,280,509,272" href="imPoint.html" alt="Point 190"  />
        <area shape="rect" coords="503,280,509,272" href="imPoint.html" alt="Point 191"  />
        <area shape="rect" coords="503,281,509,273" href="imPoint.html" alt="Point 192"  />
        <area shape="rect" coords="503,281,509,273" href="imPoint.html" alt="Point 193"  />
        <area shape="rect" coords="503,282,509,274" href="imPoint.html" alt="Point 194"  />
        <area shape="rect" coords="502,282,508,274" href="imPoint.html" alt="Point 195"  />
        <area shape="rect" coords="502,283,508,275" href="imPoint.html" alt="Point 196"  />
        <area shape="rect" coords="502,284,508,276" href="imPoint.html" alt="Point 197"  />
        <area shape="rect" coords="502,286,508,278" href="imPoint.html" alt="Point 198"  />
        <area shape="rect" coords="502,286,508,278" href="imPoint.html" alt="Point 199"  />
        <area shape="rect" coords="501,287,507,279" href="imPoint.html" alt="Point 200"  />
        <area shape="rect" coords="501,287,507,279" href="imPoint.html" alt="Point 201"  />
        <area shape="rect" coords="501,287,507,279" href="imPoint.html" alt="Point 202"  />
        <area shape="rect" coords="501,287,507,280" href="imPoint.html" alt="Point 203"  />
        <area shape="rect" coords="501,288,507,280" href="imPoint.html" alt="Point 204"  />
        <area shape="rect" coords="500,291,506,283" href="imPoint.html" alt="Point 205"  />
        <area shape="rect" coords="500,291,506,284" href="imPoint.html" alt="Point 206"  />
        <area shape="rect" coords="500,292,506,284" href="imPoint.html" alt="Point 207"  />
        <area shape="rect" coords="500,293,506,285" href="imPoint.html" alt="Point 208"  />
        <area shape="rect" coords="500,294,506,286" href="imPoint.html" alt="Point 209"  />
        <area shape="rect" coords="499,296,505,288" href="imPoint.html" alt="Point 210"  />
        <area shape="rect" coords="499,296,505,288" href="imPoint.html" alt="Point 211"  />
        <area shape="rect" coords="499,296,505,288" href="imPoint.html" alt="Point 212"  />
        <area shape="rect" coords="499,296,505,288" href="imPoint.html" alt="Point 213"  />
        <area shape="rect" coords="499,296,505,288" href="imPoint.html" alt="Point 214"  />
        <area shape="rect" coords="498,296,504,288" href="imPoint.html" alt="Point 215"  />
        <area shape="rect" coords="498,296,504,288" href="imPoint.html" alt="Point 216"  />
        <area shape="rect" coords="498,296,504,288" href="imPoint.html" alt="Point 217"  />
        <area shape="rect" coords="498,296,504,288" href="imPoint.html" alt="Point 218"  />
        <area shape="rect" coords="498,296,504,288" href="imPoint.html" alt="Point 219"  />
        <area shape="rect" coords="497,296,503,289" href="imPoint.html" alt="Point 220"  />
        <area shape="rect" coords="497,296,503,289" href="imPoint.html" alt="Point 221"  />
        <area shape="rect" coords="497,297,503,289" href="imPoint.html" alt="Point 222"  />
        <area shape="rect" coords="497,297,503,289" href="imPoint.html" alt="Point 223"  />
        <area shape="rect" coords="497,297,503,289" href="imPoint.html" alt="Point 224"  />
        <area shape="rect" coords="497,297,503,289" href="imPoint.html" alt="Point 225"  />
        <area shape="rect" coords="496,297,502,290" href="imPoint.html" alt="Point 226"  />
        <area shape="rect" coords="496,297,502,290" href="imPoint.html" alt="Point 227"  />
        <area shape="rect" coords="496,298,502,290" href="imPoint.html" alt="Point 228"  />
        <area shape="rect" coords="496,298,502,290" href="imPoint.html" alt="Point 229"  />
        <area shape="rect" coords="496,298,502,290" href="imPoint.html" alt="Point 230"  />
        <area shape="rect" coords="496,298,502,290" href="imPoint.html" alt="Point 231"  />
        <area shape="rect" coords="495,298,501,290" href="imPoint.html" alt="Point 232"  />
        <area shape="rect" coords="495,298,501,291" href="imPoint.html" alt="Point 233"  />
        <area shape="rect" coords="495,299,501,291" href="imPoint.html" alt="Point 234"  />
        <area shape="rect" coords="495,299,501,292" href="imPoint.html" alt="Point 235"  />
        <area shape="rect" coords="495,300,501,292" href="imPoint.html" alt="Point 236"  />
        <area shape="rect" coords="495,300,500,292" href="imPoint.html" alt="Point 237"  />
        <area shape="rect" coords="494,300,500,292" href="imPoint.html" alt="Point 238"  />
        <area shape="rect" coords="494,300,500,292" href="imPoint.html" alt="Point 239"  />
        <area shape="rect" coords="494,300,500,292" href="imPoint.html" alt="Point 240"  />
        <area shape="rect" coords="494,300,500,292" href="imPoint.html" alt="Point 241"  />
        <area shape="rect" coords="494,300,500,292" href="imPoint.html" alt="Point 242"  />
        <area shape="rect" coords="494,300,499,292" href="imPoint.html" alt="Point 243"  />
        <area shape="rect" coords="493,300,499,292" href="imPoint.html" alt="Point 244"  />
        <area shape="rect" coords="493,300,499,292" href="imPoint.html" alt="Point 245"  />
        <area shape="rect" coords="493,300,499,292" href="imPoint.html" alt="Point 246"  />
        <area shape="rect" coords="493,300,499,292" href="imPoint.html" alt="Point 247"  />
        <area shape="rect" coords="493,300,499,292" href="imPoint.html" alt="Point 248"  />
        <area shape="rect" coords="493,300,499,292" href="imPoint.html" alt="Point 249"  />
        <area shape="rect" coords="492,300,498,292" href="imPoint.html" alt="Point 250"  />
      </map>
    </div>
  );
}
