import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const Possession = () => {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [patrimoine, setPatrimoine] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [patrimoineTotal, setPatrimoineTotal] = useState(null);
  const [newPerson, setNewPerson] = useState({ nom: "", possessions: [] });
  const [newPossession, setNewPossession] = useState({
    type: "",
    libelle: "",
    valeur: "",
    dateDebut: null,
    dateFin: null,
    tauxAmortissement: null,
    valeurConstante: null,
  });

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/persons");
        setPersons(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des personnes", error);
      }
    };
    fetchPersons();
  }, []);

  useEffect(() => {
    if (selectedPerson) {
      const person = persons.find((p) => p.nom === selectedPerson);
      setPatrimoine(person || null);
      setPatrimoineTotal(null);
    }
  }, [selectedPerson, persons]);

  const handleChange = (event) => {
    setSelectedPerson(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setError("");
  };

  const handleAddPerson = async () => {
    if (!newPerson.nom) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/persons",
        newPerson
      );
      setPersons([...persons, response.data]);
      setSelectedPerson(response.data.nom);
      resetNewPersonForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la personne", error);
    }
  };

  const handleAddPossession = () => {
    if (!newPossession.libelle) return;
    setNewPerson((prev) => ({
      ...prev,
      possessions: [...prev.possessions, newPossession],
    }));
    resetNewPossessionForm();
  };

  const handleValider = () => {
    if (!selectedDate) {
      setError("Veuillez sélectionner une date avant de valider.");
      return;
    }

    const total = patrimoine.possessions.reduce((acc, possession) => {
      return acc + Number(possession.valeur || possession.valeurConstante);
    }, 0);

    setPatrimoineTotal(total);
  };

  const resetNewPersonForm = () => {
    setNewPerson({ nom: "", possessions: [] });
    resetNewPossessionForm();
  };

  const resetNewPossessionForm = () => {
    setNewPossession({
      type: "",
      libelle: "",
      valeur: "",
      dateDebut: null,
      dateFin: null,
      tauxAmortissement: null,
      valeurConstante: null,
    });
  };

  return (
    <div className="container mt-5">
      <div className="mt-5">
        <h2 className="text-primary">Ajouter une nouvelle personne</h2>
        <div className="form-group mb-3">
          <label htmlFor="personName">Nom</label>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">
                <i className="fas fa-user"></i>
              </span>
            </div>
            <input
              type="text"
              id="personName"
              className="form-control"
              placeholder="Nom"
              value={newPerson.nom}
              onChange={(e) =>
                setNewPerson({ ...newPerson, nom: e.target.value })
              }
            />
          </div>
        </div>

        <h3 className="text-success">Ajouter des possessions :</h3>
        <div className="form-group mb-3">
          <label htmlFor="possessionType">Type</label>
          <input
            type="text"
            id="possessionType"
            placeholder="Type"
            className="form-control mb-2"
            value={newPossession.type}
            onChange={(e) =>
              setNewPossession({ ...newPossession, type: e.target.value })
            }
          />
          <label htmlFor="possessionLibelle">Libellé</label>
          <input
            type="text"
            id="possessionLibelle"
            placeholder="Libellé"
            className="form-control mb-2"
            value={newPossession.libelle}
            onChange={(e) =>
              setNewPossession({ ...newPossession, libelle: e.target.value })
            }
          />
          <label htmlFor="possessionValeur">Valeur</label>
          <input
            type="number"
            id="possessionValeur"
            placeholder="Valeur"
            className="form-control mb-2"
            value={newPossession.valeur}
            onChange={(e) =>
              setNewPossession({ ...newPossession, valeur: e.target.value })
            }
          />
          <label htmlFor="possessionDateDebut">Date de début</label>
          <input
            type="date"
            id="possessionDateDebut"
            className="form-control mb-2"
            value={newPossession.dateDebut || ""}
            onChange={(e) =>
              setNewPossession({ ...newPossession, dateDebut: e.target.value })
            }
          />
          <label htmlFor="possessionDateFin">Date de fin</label>
          <input
            type="date"
            id="possessionDateFin"
            className="form-control mb-2"
            value={newPossession.dateFin || ""}
            onChange={(e) =>
              setNewPossession({ ...newPossession, dateFin: e.target.value })
            }
          />
          <label htmlFor="possessionTauxAmortissement">
            Taux d'amortissement
          </label>
          <input
            type="number"
            id="possessionTauxAmortissement"
            placeholder="Taux d'amortissement"
            className="form-control mb-2"
            value={newPossession.tauxAmortissement || ""}
            onChange={(e) =>
              setNewPossession({
                ...newPossession,
                tauxAmortissement: e.target.value,
              })
            }
          />
          <label htmlFor="possessionValeurConstante">Valeur constante</label>
          <input
            type="number"
            id="possessionValeurConstante"
            placeholder="Valeur constante"
            className="form-control mb-2"
            value={newPossession.valeurConstante || ""}
            onChange={(e) =>
              setNewPossession({
                ...newPossession,
                valeurConstante: e.target.value,
              })
            }
          />
        </div>

        <button className="btn btn-success mb-3" onClick={handleAddPossession}>
          Ajouter Possession
        </button>
        <button className="btn btn-primary" onClick={handleAddPerson}>
          Ajouter Personne
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Possession;