// To parse this data:
//
//   import { Convert } from "./models/covid_data";
//
//   const covidData = Convert.toCovidData(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface CovidData {
    continent:                      Continent | null;
    location:                       string;
    totalCases:                     number | null;
    newCases:                       number | null;
    newCasesSmoothed:               number | null;
    totalDeaths:                    number | null;
    newDeaths:                      number | null;
    newDeathsSmoothed:              number | null;
    totalCasesPerMillion:           number | null;
    newCasesPerMillion:             number | null;
    newCasesSmoothedPerMillion:     number | null;
    totalDeathsPerMillion:          number | null;
    newDeathsPerMillion:            number | null;
    newDeathsSmoothedPerMillion:    number | null;
    reproductionRate:               null;
    icuPatients:                    number | null;
    icuPatientsPerMillion:          number | null;
    hospPatients:                   number | null;
    hospPatientsPerMillion:         number | null;
    weeklyIcuAdmissions:            number | null;
    weeklyIcuAdmissionsPerMillion:  number | null;
    weeklyHospAdmissions:           number | null;
    weeklyHospAdmissionsPerMillion: number | null;
    newTests:                       number | null;
    totalTests:                     number | null;
    totalTestsPerThousand:          number | null;
    newTestsPerThousand:            number | null;
    newTestsSmoothed:               number | null;
    newTestsSmoothedPerThousand:    number | null;
    positiveRate:                   number | null;
    testsPerCase:                   number | null;
    testsUnits:                     TestsUnits | null;
    totalVaccinations:              number | null;
    totalVaccinationsPerHundred:    number | null;
    stringencyIndex:                number | null;
    population:                     number | null;
    populationDensity:              number | null;
    medianAge:                      number | null;
    aged65_Older:                   number | null;
    aged70_Older:                   number | null;
    gdpPerCapita:                   number | null;
    extremePoverty:                 number | null;
    cardiovascDeathRate:            number | null;
    diabetesPrevalence:             number | null;
    femaleSmokers:                  number | null;
    maleSmokers:                    number | null;
    handwashingFacilities:          number | null;
    hospitalBedsPerThousand:        number | null;
    lifeExpectancy:                 number | null;
    humanDevelopmentIndex:          number | null;
}

export enum Continent {
    Africa = "Africa",
    Asia = "Asia",
    Europe = "Europe",
    NorthAmerica = "North America",
    Oceania = "Oceania",
    SouthAmerica = "South America",
}

export enum TestsUnits {
    PeopleTested = "people tested",
    SamplesTested = "samples tested",
    TestsPerformed = "tests performed",
    UnitsUnclear = "units unclear",
}



// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {

    public static toCovidData(json: string): { [key: string]: CovidData } {
        return cast(JSON.parse(json), m(r("CovidData")));
    }

    public static covidDataToJson(value: { [key: string]: CovidData }): string {
        return JSON.stringify(uncast(value, m(r("CovidData"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "CovidData": o([
        { json: "continent", js: "continent", typ: u(r("Continent"), null) },
        { json: "location", js: "location", typ: "" },
        { json: "total_cases", js: "totalCases", typ: u(0, null) },
        { json: "new_cases", js: "newCases", typ: u(0, null) },
        { json: "new_cases_smoothed", js: "newCasesSmoothed", typ: u(3.14, null) },
        { json: "total_deaths", js: "totalDeaths", typ: u(0, null) },
        { json: "new_deaths", js: "newDeaths", typ: u(0, null) },
        { json: "new_deaths_smoothed", js: "newDeathsSmoothed", typ: u(3.14, null) },
        { json: "total_cases_per_million", js: "totalCasesPerMillion", typ: u(3.14, null) },
        { json: "new_cases_per_million", js: "newCasesPerMillion", typ: u(3.14, null) },
        { json: "new_cases_smoothed_per_million", js: "newCasesSmoothedPerMillion", typ: u(3.14, null) },
        { json: "total_deaths_per_million", js: "totalDeathsPerMillion", typ: u(3.14, null) },
        { json: "new_deaths_per_million", js: "newDeathsPerMillion", typ: u(3.14, null) },
        { json: "new_deaths_smoothed_per_million", js: "newDeathsSmoothedPerMillion", typ: u(3.14, null) },
        { json: "reproduction_rate", js: "reproductionRate", typ: null },
        { json: "icu_patients", js: "icuPatients", typ: u(0, null) },
        { json: "icu_patients_per_million", js: "icuPatientsPerMillion", typ: u(3.14, null) },
        { json: "hosp_patients", js: "hospPatients", typ: u(0, null) },
        { json: "hosp_patients_per_million", js: "hospPatientsPerMillion", typ: u(3.14, null) },
        { json: "weekly_icu_admissions", js: "weeklyIcuAdmissions", typ: u(3.14, null) },
        { json: "weekly_icu_admissions_per_million", js: "weeklyIcuAdmissionsPerMillion", typ: u(3.14, null) },
        { json: "weekly_hosp_admissions", js: "weeklyHospAdmissions", typ: u(3.14, null) },
        { json: "weekly_hosp_admissions_per_million", js: "weeklyHospAdmissionsPerMillion", typ: u(3.14, null) },
        { json: "new_tests", js: "newTests", typ: u(0, null) },
        { json: "total_tests", js: "totalTests", typ: u(0, null) },
        { json: "total_tests_per_thousand", js: "totalTestsPerThousand", typ: u(3.14, null) },
        { json: "new_tests_per_thousand", js: "newTestsPerThousand", typ: u(3.14, null) },
        { json: "new_tests_smoothed", js: "newTestsSmoothed", typ: u(0, null) },
        { json: "new_tests_smoothed_per_thousand", js: "newTestsSmoothedPerThousand", typ: u(3.14, null) },
        { json: "positive_rate", js: "positiveRate", typ: u(3.14, null) },
        { json: "tests_per_case", js: "testsPerCase", typ: u(3.14, null) },
        { json: "tests_units", js: "testsUnits", typ: u(r("TestsUnits"), null) },
        { json: "total_vaccinations", js: "totalVaccinations", typ: u(0, null) },
        { json: "total_vaccinations_per_hundred", js: "totalVaccinationsPerHundred", typ: u(3.14, null) },
        { json: "stringency_index", js: "stringencyIndex", typ: u(3.14, null) },
        { json: "population", js: "population", typ: u(0, null) },
        { json: "population_density", js: "populationDensity", typ: u(3.14, null) },
        { json: "median_age", js: "medianAge", typ: u(3.14, null) },
        { json: "aged_65_older", js: "aged65_Older", typ: u(3.14, null) },
        { json: "aged_70_older", js: "aged70_Older", typ: u(3.14, null) },
        { json: "gdp_per_capita", js: "gdpPerCapita", typ: u(3.14, null) },
        { json: "extreme_poverty", js: "extremePoverty", typ: u(3.14, null) },
        { json: "cardiovasc_death_rate", js: "cardiovascDeathRate", typ: u(3.14, null) },
        { json: "diabetes_prevalence", js: "diabetesPrevalence", typ: u(3.14, null) },
        { json: "female_smokers", js: "femaleSmokers", typ: u(3.14, null) },
        { json: "male_smokers", js: "maleSmokers", typ: u(3.14, null) },
        { json: "handwashing_facilities", js: "handwashingFacilities", typ: u(3.14, null) },
        { json: "hospital_beds_per_thousand", js: "hospitalBedsPerThousand", typ: u(3.14, null) },
        { json: "life_expectancy", js: "lifeExpectancy", typ: u(3.14, null) },
        { json: "human_development_index", js: "humanDevelopmentIndex", typ: u(3.14, null) },
    ], false),
    "Continent": [
        "Africa",
        "Asia",
        "Europe",
        "North America",
        "Oceania",
        "South America",
    ],
    "TestsUnits": [
        "people tested",
        "samples tested",
        "tests performed",
        "units unclear",
    ],
};
