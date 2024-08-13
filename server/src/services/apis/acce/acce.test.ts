import { ReadStream } from "node:fs";

import nock, { cleanAll } from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { downloadCsvExtraction, login } from "./acce.js";

describe("login", () => {
  it("should login correctly", async () => {
    const scope = nock("https://dep.adc.education.fr/acce")
      .post("/ajax/ident.php", (body) => {
        expect(body).toEqual({
          json: '{"id":"username","mdp":"pass","nom":null,"prenom":null,"email":null,"fonction":null,"organisme":null,"commentaire":null,"captcha_code":null}',
        });
        return true;
      })
      .reply(200, "", {
        "set-cookie": "men_default=session_token;",
      });

    await expect(login()).resolves.toEqual({
      Cookie: "men_default=session_token",
    });

    scope.done();
  });

  it("should error when cookie session name changed", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "invalid_cookie_name=session_token;",
    });

    await expect(login()).rejects.toThrow("api.acce: unable to login");

    scope.done();
  });

  it("should error when cookie session is missing", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "");

    await expect(login()).rejects.toThrow("api.acce: unable to login");

    scope.done();
  });

  it("should error when login is not success", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(401, "");

    await expect(login()).rejects.toThrow("api.acce: unable to login");

    scope.done();
  });
});

describe("downloadCsvExtraction", () => {
  beforeEach(() => {
    cleanAll();
  });
  afterEach(() => {
    cleanAll();
  });

  it("should download response and return a readStream", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "men_default=session_token;",
    });

    scope
      .post(
        "/getextract.php",
        "opt_sort_uai=numero_uai&opt_type=csv&chk_uai%5B%5D=nature_uai&chk_uai%5B%5D=nature_uai_libe&chk_uai%5B%5D=type_uai&chk_uai%5B%5D=type_uai_libe&chk_uai%5B%5D=etat_etablissement&chk_uai%5B%5D=etat_etablissement_libe&chk_uai%5B%5D=ministere_tutelle&chk_uai%5B%5D=ministere_tutelle_libe&chk_uai%5B%5D=tutelle_secondaire&chk_uai%5B%5D=tutelle_secondaire_libe&chk_uai%5B%5D=secteur_public_prive&chk_uai%5B%5D=secteur_public_prive_libe&chk_uai%5B%5D=sigle_uai&chk_uai%5B%5D=categorie_juridique&chk_uai%5B%5D=categorie_juridique_libe&chk_uai%5B%5D=contrat_etablissement&chk_uai%5B%5D=contrat_etablissement_libe&chk_uai%5B%5D=categorie_financiere&chk_uai%5B%5D=categorie_financiere_libe&chk_uai%5B%5D=situation_comptable&chk_uai%5B%5D=situation_comptable_libe&chk_uai%5B%5D=niveau_uai&chk_uai%5B%5D=niveau_uai_libe&chk_uai%5B%5D=commune&chk_uai%5B%5D=commune_libe&chk_uai%5B%5D=academie&chk_uai%5B%5D=academie_libe&chk_uai%5B%5D=pays&chk_uai%5B%5D=pays_libe&chk_uai%5B%5D=departement_insee_3&chk_uai%5B%5D=departement_insee_3_libe&chk_uai%5B%5D=denomination_principale_uai&chk_uai%5B%5D=appellation_officielle&chk_uai%5B%5D=patronyme_uai&chk_uai%5B%5D=hebergement_etablissement&chk_uai%5B%5D=hebergement_etablissement_libe&chk_uai%5B%5D=numero_siren_siret_uai&chk_uai%5B%5D=numero_finess_uai&chk_uai%5B%5D=date_ouverture&chk_uai%5B%5D=date_fermeture&chk_uai%5B%5D=date_derniere_mise_a_jour&chk_uai%5B%5D=lieu_dit_uai&chk_uai%5B%5D=adresse_uai&chk_uai%5B%5D=boite_postale_uai&chk_uai%5B%5D=code_postal_uai&chk_uai%5B%5D=etat_sirad_uai&chk_uai%5B%5D=localite_acheminement_uai&chk_uai%5B%5D=pays_etranger_acheminement&chk_uai%5B%5D=numero_telephone_uai&chk_uai%5B%5D=numero_telecopieur_uai&chk_uai%5B%5D=mention_distribution&chk_uai%5B%5D=mel_uai&chk_uai%5B%5D=site_web&chk_uai%5B%5D=coordonnee_x&chk_uai%5B%5D=coordonnee_y&chk_uai%5B%5D=appariement&chk_uai%5B%5D=appariement_complement&chk_uai%5B%5D=localisation&chk_uai%5B%5D=localisation_complement&chk_uai%5B%5D=date_geolocalisation&chk_uai%5B%5D=source&chk_specificite%5B%5D=numero_uai_trouve&chk_specificite%5B%5D=code&chk_specificite%5B%5D=code_libe&chk_specificite%5B%5D=date_ouverture&chk_specificite%5B%5D=date_fermeture&chk_zone%5B%5D=numero_uai_trouve&chk_zone%5B%5D=type_zone_uai&chk_zone%5B%5D=type_zone_uai_libe&chk_zone%5B%5D=zone&chk_zone%5B%5D=zone_libe&chk_zone%5B%5D=date_ouverture&chk_zone%5B%5D=date_fermeture&chk_zone%5B%5D=date_derniere_mise_a_jour&chk_filles=1&chk_meres=1"
      )
      .matchHeader("Cookie", "men_default=session_token")
      .reply(
        200,
        'You should have a look at this "https://dep.adc.education.fr/acce/getextract.php?ex_id=some-random-id"'
      );

    scope
      .get("/getextract.php?ex_id=some-random-id")
      .matchHeader("Cookie", "men_default=session_token")
      .reply(200, "Here is your data", {
        "content-disposition": 'attachement; filename="filename.zip"',
      });

    const stream = await downloadCsvExtraction();
    expect(stream).toEqual(expect.any(ReadStream));

    scope.done();

    let data = "";
    for await (const chunk of stream) {
      data += chunk as string;
    }

    expect(data).toBe("Here is your data");
  });

  it("should wait for extract to be ready", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "men_default=session_token;",
    });

    scope
      .post(
        "/getextract.php",
        "opt_sort_uai=numero_uai&opt_type=csv&chk_uai%5B%5D=nature_uai&chk_uai%5B%5D=nature_uai_libe&chk_uai%5B%5D=type_uai&chk_uai%5B%5D=type_uai_libe&chk_uai%5B%5D=etat_etablissement&chk_uai%5B%5D=etat_etablissement_libe&chk_uai%5B%5D=ministere_tutelle&chk_uai%5B%5D=ministere_tutelle_libe&chk_uai%5B%5D=tutelle_secondaire&chk_uai%5B%5D=tutelle_secondaire_libe&chk_uai%5B%5D=secteur_public_prive&chk_uai%5B%5D=secteur_public_prive_libe&chk_uai%5B%5D=sigle_uai&chk_uai%5B%5D=categorie_juridique&chk_uai%5B%5D=categorie_juridique_libe&chk_uai%5B%5D=contrat_etablissement&chk_uai%5B%5D=contrat_etablissement_libe&chk_uai%5B%5D=categorie_financiere&chk_uai%5B%5D=categorie_financiere_libe&chk_uai%5B%5D=situation_comptable&chk_uai%5B%5D=situation_comptable_libe&chk_uai%5B%5D=niveau_uai&chk_uai%5B%5D=niveau_uai_libe&chk_uai%5B%5D=commune&chk_uai%5B%5D=commune_libe&chk_uai%5B%5D=academie&chk_uai%5B%5D=academie_libe&chk_uai%5B%5D=pays&chk_uai%5B%5D=pays_libe&chk_uai%5B%5D=departement_insee_3&chk_uai%5B%5D=departement_insee_3_libe&chk_uai%5B%5D=denomination_principale_uai&chk_uai%5B%5D=appellation_officielle&chk_uai%5B%5D=patronyme_uai&chk_uai%5B%5D=hebergement_etablissement&chk_uai%5B%5D=hebergement_etablissement_libe&chk_uai%5B%5D=numero_siren_siret_uai&chk_uai%5B%5D=numero_finess_uai&chk_uai%5B%5D=date_ouverture&chk_uai%5B%5D=date_fermeture&chk_uai%5B%5D=date_derniere_mise_a_jour&chk_uai%5B%5D=lieu_dit_uai&chk_uai%5B%5D=adresse_uai&chk_uai%5B%5D=boite_postale_uai&chk_uai%5B%5D=code_postal_uai&chk_uai%5B%5D=etat_sirad_uai&chk_uai%5B%5D=localite_acheminement_uai&chk_uai%5B%5D=pays_etranger_acheminement&chk_uai%5B%5D=numero_telephone_uai&chk_uai%5B%5D=numero_telecopieur_uai&chk_uai%5B%5D=mention_distribution&chk_uai%5B%5D=mel_uai&chk_uai%5B%5D=site_web&chk_uai%5B%5D=coordonnee_x&chk_uai%5B%5D=coordonnee_y&chk_uai%5B%5D=appariement&chk_uai%5B%5D=appariement_complement&chk_uai%5B%5D=localisation&chk_uai%5B%5D=localisation_complement&chk_uai%5B%5D=date_geolocalisation&chk_uai%5B%5D=source&chk_specificite%5B%5D=numero_uai_trouve&chk_specificite%5B%5D=code&chk_specificite%5B%5D=code_libe&chk_specificite%5B%5D=date_ouverture&chk_specificite%5B%5D=date_fermeture&chk_zone%5B%5D=numero_uai_trouve&chk_zone%5B%5D=type_zone_uai&chk_zone%5B%5D=type_zone_uai_libe&chk_zone%5B%5D=zone&chk_zone%5B%5D=zone_libe&chk_zone%5B%5D=date_ouverture&chk_zone%5B%5D=date_fermeture&chk_zone%5B%5D=date_derniere_mise_a_jour&chk_filles=1&chk_meres=1"
      )
      .reply(
        200,
        'You should have a look at this "https://dep.adc.education.fr/acce/getextract.php?ex_id=some-random-id"'
      );

    scope.get("/getextract.php?ex_id=some-random-id").times(5).reply(200, "Wait");

    scope.get("/getextract.php?ex_id=some-random-id").reply(200, "Here is your data", {
      "content-disposition": 'attachement; filename="filename.zip"',
    });

    const stream = await downloadCsvExtraction();
    expect(stream).toEqual(expect.any(ReadStream));

    scope.done();

    let data = "";
    for await (const chunk of stream) {
      data += chunk as string;
    }

    expect(data).toBe("Here is your data");
  });

  it("should error on timeout", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "men_default=session_token;",
    });

    scope
      .post(
        "/getextract.php",
        "opt_sort_uai=numero_uai&opt_type=csv&chk_uai%5B%5D=nature_uai&chk_uai%5B%5D=nature_uai_libe&chk_uai%5B%5D=type_uai&chk_uai%5B%5D=type_uai_libe&chk_uai%5B%5D=etat_etablissement&chk_uai%5B%5D=etat_etablissement_libe&chk_uai%5B%5D=ministere_tutelle&chk_uai%5B%5D=ministere_tutelle_libe&chk_uai%5B%5D=tutelle_secondaire&chk_uai%5B%5D=tutelle_secondaire_libe&chk_uai%5B%5D=secteur_public_prive&chk_uai%5B%5D=secteur_public_prive_libe&chk_uai%5B%5D=sigle_uai&chk_uai%5B%5D=categorie_juridique&chk_uai%5B%5D=categorie_juridique_libe&chk_uai%5B%5D=contrat_etablissement&chk_uai%5B%5D=contrat_etablissement_libe&chk_uai%5B%5D=categorie_financiere&chk_uai%5B%5D=categorie_financiere_libe&chk_uai%5B%5D=situation_comptable&chk_uai%5B%5D=situation_comptable_libe&chk_uai%5B%5D=niveau_uai&chk_uai%5B%5D=niveau_uai_libe&chk_uai%5B%5D=commune&chk_uai%5B%5D=commune_libe&chk_uai%5B%5D=academie&chk_uai%5B%5D=academie_libe&chk_uai%5B%5D=pays&chk_uai%5B%5D=pays_libe&chk_uai%5B%5D=departement_insee_3&chk_uai%5B%5D=departement_insee_3_libe&chk_uai%5B%5D=denomination_principale_uai&chk_uai%5B%5D=appellation_officielle&chk_uai%5B%5D=patronyme_uai&chk_uai%5B%5D=hebergement_etablissement&chk_uai%5B%5D=hebergement_etablissement_libe&chk_uai%5B%5D=numero_siren_siret_uai&chk_uai%5B%5D=numero_finess_uai&chk_uai%5B%5D=date_ouverture&chk_uai%5B%5D=date_fermeture&chk_uai%5B%5D=date_derniere_mise_a_jour&chk_uai%5B%5D=lieu_dit_uai&chk_uai%5B%5D=adresse_uai&chk_uai%5B%5D=boite_postale_uai&chk_uai%5B%5D=code_postal_uai&chk_uai%5B%5D=etat_sirad_uai&chk_uai%5B%5D=localite_acheminement_uai&chk_uai%5B%5D=pays_etranger_acheminement&chk_uai%5B%5D=numero_telephone_uai&chk_uai%5B%5D=numero_telecopieur_uai&chk_uai%5B%5D=mention_distribution&chk_uai%5B%5D=mel_uai&chk_uai%5B%5D=site_web&chk_uai%5B%5D=coordonnee_x&chk_uai%5B%5D=coordonnee_y&chk_uai%5B%5D=appariement&chk_uai%5B%5D=appariement_complement&chk_uai%5B%5D=localisation&chk_uai%5B%5D=localisation_complement&chk_uai%5B%5D=date_geolocalisation&chk_uai%5B%5D=source&chk_specificite%5B%5D=numero_uai_trouve&chk_specificite%5B%5D=code&chk_specificite%5B%5D=code_libe&chk_specificite%5B%5D=date_ouverture&chk_specificite%5B%5D=date_fermeture&chk_zone%5B%5D=numero_uai_trouve&chk_zone%5B%5D=type_zone_uai&chk_zone%5B%5D=type_zone_uai_libe&chk_zone%5B%5D=zone&chk_zone%5B%5D=zone_libe&chk_zone%5B%5D=date_ouverture&chk_zone%5B%5D=date_fermeture&chk_zone%5B%5D=date_derniere_mise_a_jour&chk_filles=1&chk_meres=1"
      )
      .reply(
        200,
        'You should have a look at this "https://dep.adc.education.fr/acce/getextract.php?ex_id=some-random-id"'
      );

    scope.get("/getextract.php?ex_id=some-random-id").times(15).reply(200, "Wait");

    await expect(downloadCsvExtraction()).rejects.toThrow("api.acce: unable to download acce database");
  });

  it("should error when check extract status fail", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "men_default=session_token;",
    });

    scope
      .post(
        "/getextract.php",
        "opt_sort_uai=numero_uai&opt_type=csv&chk_uai%5B%5D=nature_uai&chk_uai%5B%5D=nature_uai_libe&chk_uai%5B%5D=type_uai&chk_uai%5B%5D=type_uai_libe&chk_uai%5B%5D=etat_etablissement&chk_uai%5B%5D=etat_etablissement_libe&chk_uai%5B%5D=ministere_tutelle&chk_uai%5B%5D=ministere_tutelle_libe&chk_uai%5B%5D=tutelle_secondaire&chk_uai%5B%5D=tutelle_secondaire_libe&chk_uai%5B%5D=secteur_public_prive&chk_uai%5B%5D=secteur_public_prive_libe&chk_uai%5B%5D=sigle_uai&chk_uai%5B%5D=categorie_juridique&chk_uai%5B%5D=categorie_juridique_libe&chk_uai%5B%5D=contrat_etablissement&chk_uai%5B%5D=contrat_etablissement_libe&chk_uai%5B%5D=categorie_financiere&chk_uai%5B%5D=categorie_financiere_libe&chk_uai%5B%5D=situation_comptable&chk_uai%5B%5D=situation_comptable_libe&chk_uai%5B%5D=niveau_uai&chk_uai%5B%5D=niveau_uai_libe&chk_uai%5B%5D=commune&chk_uai%5B%5D=commune_libe&chk_uai%5B%5D=academie&chk_uai%5B%5D=academie_libe&chk_uai%5B%5D=pays&chk_uai%5B%5D=pays_libe&chk_uai%5B%5D=departement_insee_3&chk_uai%5B%5D=departement_insee_3_libe&chk_uai%5B%5D=denomination_principale_uai&chk_uai%5B%5D=appellation_officielle&chk_uai%5B%5D=patronyme_uai&chk_uai%5B%5D=hebergement_etablissement&chk_uai%5B%5D=hebergement_etablissement_libe&chk_uai%5B%5D=numero_siren_siret_uai&chk_uai%5B%5D=numero_finess_uai&chk_uai%5B%5D=date_ouverture&chk_uai%5B%5D=date_fermeture&chk_uai%5B%5D=date_derniere_mise_a_jour&chk_uai%5B%5D=lieu_dit_uai&chk_uai%5B%5D=adresse_uai&chk_uai%5B%5D=boite_postale_uai&chk_uai%5B%5D=code_postal_uai&chk_uai%5B%5D=etat_sirad_uai&chk_uai%5B%5D=localite_acheminement_uai&chk_uai%5B%5D=pays_etranger_acheminement&chk_uai%5B%5D=numero_telephone_uai&chk_uai%5B%5D=numero_telecopieur_uai&chk_uai%5B%5D=mention_distribution&chk_uai%5B%5D=mel_uai&chk_uai%5B%5D=site_web&chk_uai%5B%5D=coordonnee_x&chk_uai%5B%5D=coordonnee_y&chk_uai%5B%5D=appariement&chk_uai%5B%5D=appariement_complement&chk_uai%5B%5D=localisation&chk_uai%5B%5D=localisation_complement&chk_uai%5B%5D=date_geolocalisation&chk_uai%5B%5D=source&chk_specificite%5B%5D=numero_uai_trouve&chk_specificite%5B%5D=code&chk_specificite%5B%5D=code_libe&chk_specificite%5B%5D=date_ouverture&chk_specificite%5B%5D=date_fermeture&chk_zone%5B%5D=numero_uai_trouve&chk_zone%5B%5D=type_zone_uai&chk_zone%5B%5D=type_zone_uai_libe&chk_zone%5B%5D=zone&chk_zone%5B%5D=zone_libe&chk_zone%5B%5D=date_ouverture&chk_zone%5B%5D=date_fermeture&chk_zone%5B%5D=date_derniere_mise_a_jour&chk_filles=1&chk_meres=1"
      )
      .reply(
        200,
        'You should have a look at this "https://dep.adc.education.fr/acce/getextract.php?ex_id=some-random-id"'
      );

    scope.get("/getextract.php?ex_id=some-random-id").reply(500, "Ooops");

    await expect(downloadCsvExtraction()).rejects.toThrow("api.acce: unable to download acce database");
  });

  it("should error when generate extract doesn't return extract_id", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "men_default=session_token;",
    });

    scope
      .post(
        "/getextract.php",
        "opt_sort_uai=numero_uai&opt_type=csv&chk_uai%5B%5D=nature_uai&chk_uai%5B%5D=nature_uai_libe&chk_uai%5B%5D=type_uai&chk_uai%5B%5D=type_uai_libe&chk_uai%5B%5D=etat_etablissement&chk_uai%5B%5D=etat_etablissement_libe&chk_uai%5B%5D=ministere_tutelle&chk_uai%5B%5D=ministere_tutelle_libe&chk_uai%5B%5D=tutelle_secondaire&chk_uai%5B%5D=tutelle_secondaire_libe&chk_uai%5B%5D=secteur_public_prive&chk_uai%5B%5D=secteur_public_prive_libe&chk_uai%5B%5D=sigle_uai&chk_uai%5B%5D=categorie_juridique&chk_uai%5B%5D=categorie_juridique_libe&chk_uai%5B%5D=contrat_etablissement&chk_uai%5B%5D=contrat_etablissement_libe&chk_uai%5B%5D=categorie_financiere&chk_uai%5B%5D=categorie_financiere_libe&chk_uai%5B%5D=situation_comptable&chk_uai%5B%5D=situation_comptable_libe&chk_uai%5B%5D=niveau_uai&chk_uai%5B%5D=niveau_uai_libe&chk_uai%5B%5D=commune&chk_uai%5B%5D=commune_libe&chk_uai%5B%5D=academie&chk_uai%5B%5D=academie_libe&chk_uai%5B%5D=pays&chk_uai%5B%5D=pays_libe&chk_uai%5B%5D=departement_insee_3&chk_uai%5B%5D=departement_insee_3_libe&chk_uai%5B%5D=denomination_principale_uai&chk_uai%5B%5D=appellation_officielle&chk_uai%5B%5D=patronyme_uai&chk_uai%5B%5D=hebergement_etablissement&chk_uai%5B%5D=hebergement_etablissement_libe&chk_uai%5B%5D=numero_siren_siret_uai&chk_uai%5B%5D=numero_finess_uai&chk_uai%5B%5D=date_ouverture&chk_uai%5B%5D=date_fermeture&chk_uai%5B%5D=date_derniere_mise_a_jour&chk_uai%5B%5D=lieu_dit_uai&chk_uai%5B%5D=adresse_uai&chk_uai%5B%5D=boite_postale_uai&chk_uai%5B%5D=code_postal_uai&chk_uai%5B%5D=etat_sirad_uai&chk_uai%5B%5D=localite_acheminement_uai&chk_uai%5B%5D=pays_etranger_acheminement&chk_uai%5B%5D=numero_telephone_uai&chk_uai%5B%5D=numero_telecopieur_uai&chk_uai%5B%5D=mention_distribution&chk_uai%5B%5D=mel_uai&chk_uai%5B%5D=site_web&chk_uai%5B%5D=coordonnee_x&chk_uai%5B%5D=coordonnee_y&chk_uai%5B%5D=appariement&chk_uai%5B%5D=appariement_complement&chk_uai%5B%5D=localisation&chk_uai%5B%5D=localisation_complement&chk_uai%5B%5D=date_geolocalisation&chk_uai%5B%5D=source&chk_specificite%5B%5D=numero_uai_trouve&chk_specificite%5B%5D=code&chk_specificite%5B%5D=code_libe&chk_specificite%5B%5D=date_ouverture&chk_specificite%5B%5D=date_fermeture&chk_zone%5B%5D=numero_uai_trouve&chk_zone%5B%5D=type_zone_uai&chk_zone%5B%5D=type_zone_uai_libe&chk_zone%5B%5D=zone&chk_zone%5B%5D=zone_libe&chk_zone%5B%5D=date_ouverture&chk_zone%5B%5D=date_fermeture&chk_zone%5B%5D=date_derniere_mise_a_jour&chk_filles=1&chk_meres=1"
      )
      .reply(
        200,
        'You should have a look at this "https://dep.adc.education.fr/acce/the_api_changed?ex_id=some-random-id"'
      );

    await expect(downloadCsvExtraction()).rejects.toThrow("api.acce: unable to download acce database");
    scope.done();
  });

  it("should error when generate extract failed", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(200, "", {
      "set-cookie": "men_default=session_token;",
    });

    scope
      .post(
        "/getextract.php",
        "opt_sort_uai=numero_uai&opt_type=csv&chk_uai%5B%5D=nature_uai&chk_uai%5B%5D=nature_uai_libe&chk_uai%5B%5D=type_uai&chk_uai%5B%5D=type_uai_libe&chk_uai%5B%5D=etat_etablissement&chk_uai%5B%5D=etat_etablissement_libe&chk_uai%5B%5D=ministere_tutelle&chk_uai%5B%5D=ministere_tutelle_libe&chk_uai%5B%5D=tutelle_secondaire&chk_uai%5B%5D=tutelle_secondaire_libe&chk_uai%5B%5D=secteur_public_prive&chk_uai%5B%5D=secteur_public_prive_libe&chk_uai%5B%5D=sigle_uai&chk_uai%5B%5D=categorie_juridique&chk_uai%5B%5D=categorie_juridique_libe&chk_uai%5B%5D=contrat_etablissement&chk_uai%5B%5D=contrat_etablissement_libe&chk_uai%5B%5D=categorie_financiere&chk_uai%5B%5D=categorie_financiere_libe&chk_uai%5B%5D=situation_comptable&chk_uai%5B%5D=situation_comptable_libe&chk_uai%5B%5D=niveau_uai&chk_uai%5B%5D=niveau_uai_libe&chk_uai%5B%5D=commune&chk_uai%5B%5D=commune_libe&chk_uai%5B%5D=academie&chk_uai%5B%5D=academie_libe&chk_uai%5B%5D=pays&chk_uai%5B%5D=pays_libe&chk_uai%5B%5D=departement_insee_3&chk_uai%5B%5D=departement_insee_3_libe&chk_uai%5B%5D=denomination_principale_uai&chk_uai%5B%5D=appellation_officielle&chk_uai%5B%5D=patronyme_uai&chk_uai%5B%5D=hebergement_etablissement&chk_uai%5B%5D=hebergement_etablissement_libe&chk_uai%5B%5D=numero_siren_siret_uai&chk_uai%5B%5D=numero_finess_uai&chk_uai%5B%5D=date_ouverture&chk_uai%5B%5D=date_fermeture&chk_uai%5B%5D=date_derniere_mise_a_jour&chk_uai%5B%5D=lieu_dit_uai&chk_uai%5B%5D=adresse_uai&chk_uai%5B%5D=boite_postale_uai&chk_uai%5B%5D=code_postal_uai&chk_uai%5B%5D=etat_sirad_uai&chk_uai%5B%5D=localite_acheminement_uai&chk_uai%5B%5D=pays_etranger_acheminement&chk_uai%5B%5D=numero_telephone_uai&chk_uai%5B%5D=numero_telecopieur_uai&chk_uai%5B%5D=mention_distribution&chk_uai%5B%5D=mel_uai&chk_uai%5B%5D=site_web&chk_uai%5B%5D=coordonnee_x&chk_uai%5B%5D=coordonnee_y&chk_uai%5B%5D=appariement&chk_uai%5B%5D=appariement_complement&chk_uai%5B%5D=localisation&chk_uai%5B%5D=localisation_complement&chk_uai%5B%5D=date_geolocalisation&chk_uai%5B%5D=source&chk_specificite%5B%5D=numero_uai_trouve&chk_specificite%5B%5D=code&chk_specificite%5B%5D=code_libe&chk_specificite%5B%5D=date_ouverture&chk_specificite%5B%5D=date_fermeture&chk_zone%5B%5D=numero_uai_trouve&chk_zone%5B%5D=type_zone_uai&chk_zone%5B%5D=type_zone_uai_libe&chk_zone%5B%5D=zone&chk_zone%5B%5D=zone_libe&chk_zone%5B%5D=date_ouverture&chk_zone%5B%5D=date_fermeture&chk_zone%5B%5D=date_derniere_mise_a_jour&chk_filles=1&chk_meres=1"
      )
      .reply(500);

    await expect(downloadCsvExtraction()).rejects.toThrow("api.acce: unable to download acce database");

    scope.done();
  });

  it("should error when login fail", async () => {
    const scope = nock("https://dep.adc.education.fr/acce").post("/ajax/ident.php").reply(401);
    await expect(downloadCsvExtraction()).rejects.toThrow("api.acce: unable to download acce database");

    scope.done();
  });
});
