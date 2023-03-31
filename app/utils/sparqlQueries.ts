export const getAllMunicipalitiesQuery = ({
  municipality,
}: {
  municipality?: string;
}): string => {
  console.log(municipality);
  return `PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX terms: <http://purl.org/dc/terms/>
PREFIX title: <http://purl.org/dc/terms/title>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?geplandeStart ?location ?title_agenda ?description ?bestuursclassificatie ?eenheid_werkingsgebied_label WHERE {
  ?zitting a besluit:Zitting .
  ?zitting besluit:geplandeStart ?geplandeStart .
  OPTIONAL { ?zitting <http://www.w3.org/ns/prov#atLocation> ?location}

  ?zitting besluit:behandelt ?agendapunt.
  ?agendapunt a besluit:Agendapunt .
  ?agendapunt terms:title ?title .
  BIND(str(?title) AS ?title_agenda)
  OPTIONAL { ?agendapunt terms:description ?description .
    ?agendapunt besluit:geplandOpenbaar ?OpenbaarOfNiet .
    BIND (IF(?openbaarOfNiet = 1, "Openbaar", "Openbaar niet") as ?geplandOpenbaar)
  }

  {
    ?zitting a besluit:Zitting.
    ?zitting besluit:isGehoudenDoor ?bestuursorgaan.
    ?bestuursorgaan besluit:classificatie ?classificatie.
    ?classificatie skos:prefLabel ?bestuursclassificatie .
    ?bestuursorgaan besluit:bestuurt ?eenheid.
    ?eenheid a besluit:Bestuurseenheid .
    ?eenheid besluit:werkingsgebied ?eenheid_werkingsgebied.
    ?eenheid_werkingsgebied rdfs:label ?eenheid_werkingsgebied_label.
    ${
      municipality !== undefined && municipality !== null
        ? `?eenheid besluit:werkingsgebied [rdfs:label "${municipality}"].`
        : ""
    }
  }
  UNION
  {
    ?zitting a besluit:Zitting.
    ?zitting besluit:isGehoudenDoor ?bestuursorgaanInTijd.
    ?bestuursorgaanInTijd mandaat:isTijdspecialisatieVan ?bestuursorgaan.
    ?bestuursorgaan besluit:classificatie ?classificatie.
    ?classificatie skos:prefLabel ?bestuursclassificatie .
    ?bestuursorgaan besluit:bestuurt ?eenheid.
    ?eenheid a besluit:Bestuurseenheid .
    ?eenheid besluit:werkingsgebied ?eenheid_werkingsgebied.
    ?eenheid_werkingsgebied rdfs:label ?eenheid_werkingsgebied_label.
    ${
      municipality !== undefined && municipality !== null
        ? `?eenheid besluit:werkingsgebied [rdfs:label "${municipality}"].`
        : ""
    }
  }


          FILTER(?bestuursclassificatie = "Gemeenteraad" || ?bestuursclassificatie = "Raad voor Maatschappelijk Welzijn")

          BIND(day(now()) AS ?day)
          BIND(IF(?day < 10, "-0", "-") AS ?day2)
          BIND(month(now()) - 3 AS ?month)
          BIND(IF(?month < 1, ?month + 12, ?month) AS ?month2)
          BIND(IF(?month2 < 10, "-0", "-") AS ?month3)
          BIND(year(now()) AS ?year)
          BIND(IF(?month < 1, ?year - 1, ?year) AS ?year2)
          BIND(CONCAT(?year2, ?month3, ?month2, ?day2, ?day) as ?dayTofilter)
          BIND(xsd:date(now()) AS ?time)
          BIND(STRDT(?dayTofilter, xsd:date) AS ?filterDate)
          FILTER (?geplandeStart > ?filterDate || ?geplandeStart = ?filterDate)
        }
        ORDER BY DESC(?geplandeStart) xsd:integer( ?title_agenda ) ASC(?title_agenda)
LIMIT 10
`;
};
