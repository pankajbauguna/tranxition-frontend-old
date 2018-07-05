export interface Company {
  name: string;
  employeeNumber: string;
  taxId: string;
  website: string;
  socialMedia: {
    linkedIn: string;
    twitter: string;
    facebook: string;
  };
  jointCommission: {
    id: string;
    effectiveDate: Date;
    expirationDate: Date;
  };
  glInsurance: {
    insurerName: string;
    effectiveDate: string;
    expirationDate: string;
    aggregate: number;
    occurrence: number;
    excessUmbrella: number;
  };
  plInsurance: {    
    insurerName: string;
    effectiveDate: string;
    expirationDate: string;
    aggregate: number;
    occurrence: number;
  };
  wcInsurance: {    
    insurerName: string;
    effectiveDate: string;
    expirationDate: string;
    aggregate: number;
  };
  eoInsurance: {    
    insurerName: string;
    effectiveDate: string;
    expirationDate: string;
    aggregate: number;
    occurrence: number;
  };
  address: {
    physical: {
      address1: string;
      address2: string;
      city: string;
      state: string;
      zipcode: string;
    };
    billing: {
      address1: string;
      address2: String;
      city: string;
      state: string;
      zipcode: string;
    };
  };
}
