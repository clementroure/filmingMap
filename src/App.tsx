import { Fragment, useEffect, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

function App () {

  const [filmings, setFilmings] = useState<{recordid:string, record_timestamp: Date, adresse_lieu: string, annee_tournage: string, ardt_lieu: string, coord_x: number, coord_y: number, date_debut: string, date_fin: string, id_lieu: string, nom_producteur: string, nom_realisateur: string, nom_tournage: string, type_tournage: string}[]>()
  const [filmingSelected, setFilmingSelected] = useState<{recordid:string, record_timestamp: Date, adresse_lieu: string, annee_tournage: string, ardt_lieu: string, coord_x: number, coord_y: number, date_debut: string, date_fin: string, id_lieu: string, nom_producteur: string, nom_realisateur: string, nom_tournage: string, type_tournage: string}>()

  const [isLoading , setIsLoading] = useState(true)
  const [firstResult, setFirstResult] = useState(false)

  const [selected, setSelected] = useState('')
  const [query, setQuery] = useState('')

  const filteredFilmings =
    query === ''
      ? filmings
      : filmings!.filter((film:any) =>
          film.nom_tournage
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  useEffect(() => {

    const init = async  () => {

      const filmingExists = (name: string, _filmings: any) => {
        return _filmings.some(function(el:any) {
          return el.nom_tournage == name;
        }); 
      }

      const url = "https://opendata.paris.fr/api/records/1.0/search/?dataset=lieux-de-tournage-a-paris&q=&rows=1000&sort=annee_tournage&facet=annee_tournage&facet=type_tournage&facet=nom_tournage&facet=nom_realisateur&facet=nom_producteur&facet=ardt_lieu&facet=date_debut&facet=date_fin"
      fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          let _filmings: {recordid:string, record_timestamp: Date, adresse_lieu: string, annee_tournage: string, ardt_lieu: string, coord_x: number, coord_y: number, date_debut: string, date_fin: string, id_lieu: string, nom_producteur: string, nom_realisateur: string, nom_tournage: string, type_tournage: string}[] = [];
          for(let i =0; i<result.records.length;i++){

            // verifier le nom n'existe pas deja (eviter les doublons envoyés par l'API)
            if(!filmingExists( result.records[i].fields.nom_tournage, _filmings))
              _filmings.push({recordid: result.records[i].recordid, record_timestamp: result.records[i].record_timestamp,
                adresse_lieu: result.records[i].fields.adresse_lieu, annee_tournage: result.records[i].fields.annee_tournage, 
                ardt_lieu: result.records[i].fields.ardt_lieu, coord_x: result.records[i].fields.coord_x, 
                coord_y: result.records[i].fields.coord_y, date_debut: result.records[i].fields.date_debut, 
                date_fin: result.records[i].fields.date_fin, id_lieu: result.records[i].fields.id_lieu, 
                nom_producteur: result.records[i].fields.nom_producteur, nom_realisateur: result.records[i].fields.nom_realisateur, 
                nom_tournage: result.records[i].fields.nom_tournage, type_tournage: result.records[i].fields.type_tournage}
              );
          }
          // sort alphabetically
          _filmings.sort(function (a:any, b:any) {
            if (a.nom_tournage.toLowerCase() < b.nom_tournage.toLowerCase()) {
              return -1;
            }
            if (a.nom_tournage.toLowerCase() > b.nom_tournage.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          setFilmings(_filmings);
        });
    }

    init();
  },[]);

  const [isFirst, setIsFirst] = useState(true)
  useEffect(() => {
    if(isFirst){setIsFirst(false);return;}
    console.log(filmings)
    setIsLoading(false)
  },[filmings])

  return (
    <div className='h-screen w-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>
      {!isLoading ?
      <>
      <div className="grid place-items-center z-10">
          <div className="fixed top-8 w-72">
          <Combobox value={selected} onChange={setSelected}>
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                  displayValue={(film :any) => film.nom_tournage}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search.."
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery('')}
              >
                <Combobox.Options className="absolute mt-1 max-h-[80vh] w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredFilmings!.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                      Nothing found.
                    </div>
                  ) : (
                    filteredFilmings!.map((film) => (
                      <Combobox.Option
                        onClick={() => {setFilmingSelected(film); setFirstResult(true);}}
                        key={film.recordid}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-teal-600 text-white' : 'text-gray-900'
                          }`
                        }
                        value={film}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {film.nom_tournage}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? 'text-white' : 'text-teal-600'
                                }`}
                              >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>

        </div>
      </div>

      {firstResult &&
      <>
      <p className='text-5xl text-neutral-50 opacity-90 w-4/12 justify-center items-center text-center align-middle fixed mt-8 right-0 font-extrabold italic'>&nbsp;INFOS</p>
      <div className="flex flex-col fixed bottom-0 right-4 w-4/12 mt-6">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-4 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-center rounded-xl overflow-hidden">
                <tbody>
                  <tr className="bg-white border-b">
                      <td className="px-6 py-8 whitespace-nowrap text-sm font-medium text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Nom Tournage
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.nom_tournage}
                      </td>
                  </tr>
                  <tr className="bg-white border-b">
                      <td className="px-6 py-8 whitespace-nowrap text-sm font-medium text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Réalisateur
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.nom_realisateur}
                      </td>
                  </tr>
                  <tr className="bg-white border-b">
                      <td className="px-6 py-8 whitespace-nowrap text-sm font-medium text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Producteur
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.nom_producteur}
                      </td>
                  </tr>
                  <tr className="bg-white border-b">
                      <td className="px-6 py-8 whitespace-nowrap text-sm font-medium text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Type Tournage
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.type_tournage}
                      </td>
                  </tr>
                  <tr className="bg-white border-b">
                      <td className="px-6 py-8 whitespace-nowrap text-sm font-medium text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Début
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.date_debut}
                      </td>
                  </tr>
                  <tr className="bg-white border-b">
                      <td className="px-6 py-8 whitespace-nowrap font-medium text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Fin
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.date_fin}
                      </td>
                  </tr>
                  <tr className="bg-white border-b">
                      <td className="px-6 font-medium py-8 whitespace-nowrap text-sm text-neutral-50 border-b border-gray-800 bg-gray-800">
                        Adresse
                      </td>
                      <td className="font-medium text-gray-900 px-6 py-4 whitespace-nowrap">
                      {filmingSelected!.adresse_lieu}
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <p className='text-5xl text-neutral-50 opacity-90 w-4/12 justify-center items-center text-center align-middle fixed mt-8 font-extrabold italic'>&nbsp;&nbsp;&nbsp;FILMINGS MAP</p>
      <div className='w-4/12 h-5/6 grid place-items-center left-4 bottom-4 fixed rounded-3xl overflow-hidden'>
        <MapContainer center={[filmingSelected!.coord_y, filmingSelected!.coord_x]} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[filmingSelected!.coord_y, filmingSelected!.coord_x]} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
            <Popup>
              {filmingSelected!.adresse_lieu}
              <br/>
              {"( "+ filmingSelected!.coord_x + ", " + filmingSelected!.coord_y + ")"} 
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      </>
      }

      </>
      :
      <div>
      </div>
    }
    </div>
  )
}

export default App;
