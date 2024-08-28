import React, { useState, useEffect } from "react";
import data from "../../data/data.json";
import Argent from "../../models/possessions/Argent.js";
import BienMateriel from "../../models/possessions/BienMateriel.js";
import Flux from "../../models/possessions/Flux.js";
import Patrimoine from "../../models/Patrimoine.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const PatrimoineApp = () => {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [patrimoine, setPatrimoine] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [patrimoineTotal, setPatrimoineTotal] = useState(null);

  useEffect(() => {
    const person = data.find((p) => p.nom === selectedPerson);
    if (person) {
      const possessionsInstances = person.possessions.map((possession) => {
        switch (possession.type) {
          case "Argent":
            return new Argent(
              person.nom,
              possession.libelle,
              possession.valeur,
              new Date(possession.dateDebut),
              possession.dateFin ? new Date(possession.dateFin) : null,
              possession.tauxAmortissement,
              possession.typeArgent
            );
          case "BienMateriel":
            return new BienMateriel(
              person.nom,
              possession.libelle,
              possession.valeur,
              new Date(possession.dateDebut),
              possession.dateFin ? new Date(possession.dateFin) : null,
              possession.tauxAmortissement
            );
          case "Flux":
            return new Flux(
              person.nom,
              possession.libelle,
              possession.valeurConstante,
              new Date(possession.dateDebut),
              possession.dateFin ? new Date(possession.dateFin) : null,
              possession.tauxAmortissement,
              possession.jour
            );
          default:
            return null;
        }
      });
      setPatrimoine(new Patrimoine(person.nom, possessionsInstances));
      setPatrimoineTotal(null); // Réinitialiser la somme du patrimoine total
    }
  }, [selectedPerson]);

  const handleChange = (event) => {
    setSelectedPerson(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setError("");
  };

  const handleInputChange = (index, field, value) => {
    const updatedPatrimoine = { ...patrimoine };
    updatedPatrimoine.possessions[index][field] = value;
    setPatrimoine(updatedPatrimoine);
  };

  const calculerValeurActuelle = (possession, date) => {
    let valeurActuelle = possession.getValeurApresAmortissement(new Date(date));
    if (possession.valeur === 0 && possession.valeurConstante) {
      const dateDebut = new Date(possession.dateDebut);
      const moisDiff =
        (new Date(date).getFullYear() - dateDebut.getFullYear()) * 12 +
        (new Date(date).getMonth() - dateDebut.getMonth());
      if (moisDiff >= 1) {
        valeurActuelle += moisDiff * possession.valeurConstante;
      }
    }
    return valeurActuelle;
  };

  const handleValider = () => {
    if (!selectedDate) {
      setError("Veuillez sélectionner une date avant de valider.");
      return;
    }

    const valeurs = patrimoine.possessions.map((possession) =>
      calculerValeurActuelle(possession, selectedDate)
    );

    const total = valeurs.reduce((acc, curr) => acc + curr, 0);
    setPatrimoineTotal(total);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center text-primary">
        Calculateur de Patrimoine
      </h1>
      <div className="mb-3">
        <label htmlFor="personSelect" className="form-label">
          Sélectionnez une personne :
        </label>
        <select
          id="personSelect"
          className="form-select"
          onChange={handleChange}
          value={selectedPerson}
        >
          <option value="">--Veuillez sélectionner une personne--</option>
          {data.map((person) => (
            <option key={person.nom} value={person.nom}>
              {person.nom}
            </option>
          ))}
        </select>
      </div>

      {patrimoine && patrimoine.possessions.length > 0 && (
        <div className="mt-4">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Libelle</th>
                <th>Valeur Initiale</th>
                <th>Date de début</th>
                <th>Date Fin</th>
                <th>Taux d'Amortissement</th>
                <th>Valeur Actuelle</th>
              </tr>
            </thead>
            <tbody>
              {patrimoine.possessions.map((possession, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={possession.libelle}
                      onChange={(e) =>
                        handleInputChange(index, "libelle", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={possession.valeur || possession.valeurConstante}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          possession.valeur !== undefined
                            ? "valeur"
                            : "valeurConstante",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control"
                      value={possession.dateDebut.toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "dateDebut",
                          new Date(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control"
                      value={
                        possession.dateFin
                          ? possession.dateFin.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "dateFin",
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={
                        possession.tauxAmortissement !== null
                          ? possession.tauxAmortissement
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "tauxAmortissement",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    {selectedDate
                      ? calculerValeurActuelle(
                          possession,
                          selectedDate
                        ).toFixed(2) + " Ar"
                      : "Sélectionnez une date"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <label htmlFor="dateInput" className="form-label">
              Choisissez une date :
            </label>
            <div className="input-group">
              <input
                type="date"
                id="dateInput"
                className="form-control"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <button className="btn btn-success" onClick={handleValider}>
                Valider
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          {patrimoineTotal !== null && (
            <div>
              <h2 className="mt-4 text-success">
                Valeur totale du patrimoine : {patrimoineTotal.toFixed(2)} Ar
              </h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatrimoineApp;