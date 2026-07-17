/** Ghana service areas — regions → districts/metros → delivery neighborhoods */

function area(id: number, name: string, zone: string) {
  return {
    nodeType: 'Area',
    ID: id,
    NAME: name,
    IS_COD_AVAILABLE: true,
    IS_HOME_DELIVERY: true,
    IS_PICKUP_AVAILABLE: true,
    IS_LOCKED_DOWN: false,
    Zone: { ID: zone === 'inside' ? 1 : zone === 'suburb' ? 2 : 3, NAME: zone },
  };
}

let nextId = 1;
const aid = () => nextId++;

export default {
  Divisions: [
    {
      nodeType: 'Division',
      ID: 1,
      NAME: 'Greater Accra',
      Districts: [
        {
          nodeType: 'District',
          ID: 1,
          NAME: 'Accra Metro',
          Areas: [
            area(aid(), 'Osu', 'inside'),
            area(aid(), 'Labone', 'inside'),
            area(aid(), 'Cantonments', 'inside'),
            area(aid(), 'Airport Residential', 'inside'),
            area(aid(), 'East Legon', 'inside'),
            area(aid(), 'West Legon', 'inside'),
            area(aid(), 'Dzorwulu', 'inside'),
            area(aid(), 'Roman Ridge', 'inside'),
            area(aid(), 'Ridge', 'inside'),
            area(aid(), 'Adabraka', 'inside'),
            area(aid(), 'Kokomlemle', 'inside'),
            area(aid(), 'Kaneshie', 'inside'),
            area(aid(), 'Dansoman', 'inside'),
            area(aid(), 'Ablekuma', 'inside'),
            area(aid(), 'Mamprobi', 'inside'),
            area(aid(), 'Korle Bu', 'inside'),
            area(aid(), 'Jamestown', 'inside'),
            area(aid(), 'Teshie', 'inside'),
            area(aid(), 'Nungua', 'inside'),
            area(aid(), 'La', 'inside'),
            area(aid(), 'Madina', 'suburb'),
            area(aid(), 'Adenta', 'suburb'),
            area(aid(), 'Haatso', 'suburb'),
            area(aid(), 'Kwabenya', 'suburb'),
            area(aid(), 'Achimota', 'suburb'),
            area(aid(), 'Ofankor', 'suburb'),
            area(aid(), 'Dome', 'suburb'),
            area(aid(), 'Taifa', 'suburb'),
            area(aid(), 'Spintex', 'suburb'),
            area(aid(), 'Tema Community 1', 'suburb'),
            area(aid(), 'Tema Community 2', 'suburb'),
            area(aid(), 'Tema Community 25', 'suburb'),
            area(aid(), 'Sakumono', 'suburb'),
            area(aid(), 'Lashibi', 'suburb'),
            area(aid(), 'Kasoa', 'suburb'),
            area(aid(), 'Weija', 'suburb'),
            area(aid(), 'Mallam', 'suburb'),
            area(aid(), 'Gbawe', 'suburb'),
          ],
        },
        {
          nodeType: 'District',
          ID: 2,
          NAME: 'Tema Metro',
          Areas: [
            area(aid(), 'Tema Community 5', 'suburb'),
            area(aid(), 'Tema Community 7', 'suburb'),
            area(aid(), 'Tema Community 18', 'suburb'),
            area(aid(), 'Community 11', 'suburb'),
            area(aid(), 'Ashaiman', 'suburb'),
          ],
        },
        {
          nodeType: 'District',
          ID: 3,
          NAME: 'Ga East',
          Areas: [
            area(aid(), 'Abokobi', 'suburb'),
            area(aid(), 'Pantang', 'suburb'),
            area(aid(), 'Danfa', 'suburb'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 2,
      NAME: 'Ashanti',
      Districts: [
        {
          nodeType: 'District',
          ID: 4,
          NAME: 'Kumasi Metro',
          Areas: [
            area(aid(), 'Adum', 'outside'),
            area(aid(), 'Kejetia', 'outside'),
            area(aid(), 'Asokwa', 'outside'),
            area(aid(), 'Ahodwo', 'outside'),
            area(aid(), 'Nhyiaeso', 'outside'),
            area(aid(), 'Santasi', 'outside'),
            area(aid(), 'Bantama', 'outside'),
            area(aid(), 'Suame', 'outside'),
            area(aid(), 'Tafo', 'outside'),
            area(aid(), 'Ayigya', 'outside'),
            area(aid(), 'KNUST', 'outside'),
            area(aid(), 'Ejisu', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 3,
      NAME: 'Central',
      Districts: [
        {
          nodeType: 'District',
          ID: 5,
          NAME: 'Cape Coast Metro',
          Areas: [
            area(aid(), 'Cape Coast Central', 'outside'),
            area(aid(), 'Pedu', 'outside'),
            area(aid(), 'Abura', 'outside'),
            area(aid(), 'University of Cape Coast', 'outside'),
          ],
        },
        {
          nodeType: 'District',
          ID: 6,
          NAME: 'Awutu Senya East',
          Areas: [
            area(aid(), 'Kasoa New Market', 'suburb'),
            area(aid(), 'Opeikuma', 'suburb'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 4,
      NAME: 'Western',
      Districts: [
        {
          nodeType: 'District',
          ID: 7,
          NAME: 'Sekondi-Takoradi',
          Areas: [
            area(aid(), 'Takoradi Market Circle', 'outside'),
            area(aid(), 'Beach Road', 'outside'),
            area(aid(), 'Effiakuma', 'outside'),
            area(aid(), 'Sekondi', 'outside'),
            area(aid(), 'Kwesimintsim', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 5,
      NAME: 'Eastern',
      Districts: [
        {
          nodeType: 'District',
          ID: 8,
          NAME: 'New Juaben',
          Areas: [
            area(aid(), 'Koforidua Central', 'outside'),
            area(aid(), 'Effiduase', 'outside'),
            area(aid(), 'Suhum', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 6,
      NAME: 'Volta',
      Districts: [
        {
          nodeType: 'District',
          ID: 9,
          NAME: 'Ho Municipal',
          Areas: [
            area(aid(), 'Ho Central', 'outside'),
            area(aid(), 'Ahoe', 'outside'),
            area(aid(), 'Bankoe', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 7,
      NAME: 'Northern',
      Districts: [
        {
          nodeType: 'District',
          ID: 10,
          NAME: 'Tamale Metro',
          Areas: [
            area(aid(), 'Tamale Central', 'outside'),
            area(aid(), 'Lamashegu', 'outside'),
            area(aid(), 'Sakasaka', 'outside'),
            area(aid(), 'Kalpohin', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 8,
      NAME: 'Bono',
      Districts: [
        {
          nodeType: 'District',
          ID: 11,
          NAME: 'Sunyani Municipal',
          Areas: [
            area(aid(), 'Sunyani Central', 'outside'),
            area(aid(), 'New Dormaa', 'outside'),
            area(aid(), 'Abesim', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 9,
      NAME: 'Upper East',
      Districts: [
        {
          nodeType: 'District',
          ID: 12,
          NAME: 'Bolgatanga Municipal',
          Areas: [
            area(aid(), 'Bolgatanga Central', 'outside'),
            area(aid(), 'Zaare', 'outside'),
          ],
        },
      ],
    },
    {
      nodeType: 'Division',
      ID: 10,
      NAME: 'Upper West',
      Districts: [
        {
          nodeType: 'District',
          ID: 13,
          NAME: 'Wa Municipal',
          Areas: [
            area(aid(), 'Wa Central', 'outside'),
            area(aid(), 'Dondoli', 'outside'),
          ],
        },
      ],
    },
  ],
};
