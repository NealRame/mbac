'use strict';

/// pages/prices/front.js
/// ===================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -  date:  Tue May 12 20:57:49 CEST 2015

const express = require('express');
const path = require('path');

const router = express.Router();
const page_template = path.join(__dirname, 'views', 'front.jade');

const prices = {
    list: [
        {
            link: 'self-service',
            title: 'Libre service',
            list: [
                {
                    title: 'Entrées',
                    list: [
                        {
                            title: '1 heure',
                            price: 7
                        },
                        {
                            title: '4 heures',
                            price: 21
                        },
                        {
                            title: 'carte 10 entrées',
                            price: 94,
                            noteRef: 1
                        }
                    ]
                },
                {
                    title: 'Abonnements',
                    list: [
                        {
                            title: '1 mois',
                            price: 47
                        },
                        {
                            title: '3 mois',
                            price: 116
                        },
                        {
                            title: '6 mois',
                            price: 210
                        },
                        {
                            title: '10 mois',
                            price: 290
                        }
                    ]
                }
            ]
        },
        {
            link: 'introduction',
            title: 'Atelier d\'initiation à la couture',
            price: 35
        },
        {
            link: 'sewing-machine',
            title: 'Prise en mains de votre machine',
            price: 18
        },
        {
            link: 'training',
            title: 'Formation',
            list: [
                {
                    title: 'Formation technique de montage',
                    list: [
                        {
                            title: 'Préparation',
                            price: 21
                        },
                        {
                            title: 'Coupe',
                            price: 7
                        },
                        {
                            title: 'Montage',
                            list: [
                                {
                                    title: 'fermeture à glissière basique',
                                    price: 7
                                },
                                {
                                    title: 'fermeture à glissière invisible',
                                    price: 7
                                },
                                {
                                    title: 'fermeture à glissière avec sous patte',
                                    price: 14
                                },
                                {
                                    title: 'fermeture avec croisure',
                                    price: 7
                                },
                                {
                                    title: 'monter un col / une ceinture',
                                    price: 7
                                },
                                {
                                    title: 'monter des manches',
                                    price: 7
                                },
                                {
                                    title: 'monter une poche passepoilée',
                                    price: 14
                                },
                                {
                                    title: 'monter une doublure d’une pièce de haut',
                                    price: 14
                                },
                                {
                                    title: 'monter une doublure d’une pièce de bas',
                                    price: 14
                                }
                            ]
                        },
                        {
                            title: 'Finition',
                            list: [
                                {
                                    title: 'créer un coin onglet',
                                    price: 7
                                },
                                {
                                    title: 'pose de biais et passepoil',
                                    price: 7
                                },
                                {
                                    title: 'emmanchure, encolure, bas de vêtement',
                                    price: 7
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'Formation technique de patronage',
                    list: [
                        {
                            title: 'Construction sur base existante',
                            list: [
                                {
                                    title: 'créer un patron d\'après un modèle',
                                    price: 47
                                },
                                {
                                    title: 'créer et monter une doublure',
                                    price: 47
                                },
                                {
                                    title: 'créer les sous éléments de vos projets',
                                    price: 21
                                },
                                {
                                    title: 'transformer votre patron à vos envies',
                                    price: 47,
                                    noteRef: 2
                                },
                                {
                                    title: 'modifier votre patron après essayage',
                                    price: 21
                                },
                                {
                                    title: 'adapter la taille de votre patron',
                                    price: 47,
                                    noteRef: 2
                                }
                            ]
                        },
                        {
                            title: 'Créer votre patron à vos mesures',
                            list: [
                                {
                                    title: 'créer le corsage de base',
                                    price: 47
                                },
                                {
                                    title: 'créer la jupe de base',
                                    price: 47
                                },
                                {
                                    title: 'créer la manche à votre emmanchure',
                                    price: 47
                                }
                            ]
                        }
                    ]
                }
            ],
            notes: [
            ]
        },
        {
            title: 'Carte cadeau',
            descriptions: [
                'Une formule offerte ou le montant de votre choix.',
                '-20% à l\'offreur'
            ]
        },
        {
            title: 'Tarif étudiant',
            descriptions: [
                '-20% sur le prix des abonnements.'
            ]
        }
    ],
    notes: [
        'une entrée = trois heures',
        'Projet à nous soumettre'
    ]
};

router
    // GET achievements page.
    .get('/', (req, res) => {
        res.locals.prices = prices;
        res.render(page_template);
    });

module.exports = {
    front: router
};
