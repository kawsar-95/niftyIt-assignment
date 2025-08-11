export const testData = {
  user: {
    firstName: 'Nuruddin',
    lastName: 'Kawsar',
    email: 'nuruddinkawsar1995@gmail.com',
    password: 'Test@1234',
    phone: '01860458130'
  },

  acNameplateValues: [0.5, 5, 12, 40, 120],

  mountingTypes: [
    'Carport',
    'GroundFixed', // Ground (Fixed)
    'GroundTracker', // Ground (Tracker) 
    'Rooftop'
  ],

  moduleTechnologies: [
    'Monofacial',
    'Bifacial'
  ],

  // Detailed form data
  detailedFormData: {
    isExistingSite: 'Yes, this is a new project to Denowatts', // Exact option text from dropdown
    projectName: 'Test Solar Project',
    projectOwner: 'Test Company Inc',
    projectAddress: '123 Solar Street',
    town: 'Solar City',
    state: 'Alabama',
    zipCode: '12345',
    energizationYear: '2025',
    newRetrofit: 'New', // Options: 'New' or 'Retrofit'
    mountingTypesDetailed: ['Carport', 'GroundFixed', 'GroundTracker', 'Rooftop'], // All mounting types
    moduleTypesDetailed: ['Monofacial', 'Bifacial'] // All module types
  },

  states: ['Alabama'],

  projectYear: '2025',

  services: [
    'Basic Weather',
    'Basic Monitoring',
    'Advanced Energy Accounting',
    'Expert Optimization Guide'
  ],

  serviceDurations: [1, 5],

  cellularPlans: [
    'None',
    '250MB',
    '1GB',
    '5GB',
    '10GB'
  ],

  // Helper function to create form data for each AC nameplate value
  createDetailedFormData: (acNameplate: number) => ({
    isExistingSite: 'Yes, this is a new project to Denowatts', // Exact dropdown option text
    projectName: `Solar Project ${acNameplate}MW`,
    projectOwner: 'Test Company Inc',
    projectAddress: '123 Solar Street',
    town: 'Solar City',
    state: 'Alabama', // Dropdown option
    zipCode: '12345',
    acNameplate: acNameplate,
    energizationYear: '2025', // Year picker
    newRetrofit: 'New', // Radio button option
    mountingTypes: ['Carport', 'GroundFixed', 'GroundTracker', 'Rooftop'], // All mounting types
    moduleTypes: ['Monofacial', 'Bifacial'] // All module types
  }),

  // Hardware calculation logic
  calculateHardware: (acNameplate: number) => {
    if (acNameplate < 1) {
      return { sensors: 1, gateways: 1 };
    } else if (acNameplate >= 1 && acNameplate < 10) {
      return { sensors: 2, gateways: 1 };
    } else if (acNameplate >= 10 && acNameplate < 25) {
      return { sensors: 4, gateways: 2 };
    } else if (acNameplate >= 25 && acNameplate < 100) {
      return { sensors: 6, gateways: 3 };
    } else {
      return { sensors: 8, gateways: 4 };
    }
  }
};
