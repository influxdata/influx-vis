import * as csv01 from "./bandCSV";
import * as csv02 from "./fluxCSV";
import * as csv03 from "./mosaicCSV";
import * as csv04 from "./tableGraph";

const csvs = [csv01, csv02, csv03, csv04].map(x => Object.entries(x)).flat()

export default csvs;
