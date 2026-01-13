
import { UserIdentity } from '../types';

export const WALID_IDENTITY: UserIdentity = {
  fullName: "Walid Kenawy",
  role: "Director",
  companyName: "ONE DIRECTION sp. z o.o.",
  address: "Gagarina 3/5/7 m47, 26-600 Radom, Poland",
  krs: "0000718357",
  vat: "PL7962982725",
  eori: "PL79629827250000",
  website: "https://nobelspiritlabs.store",
  email: "info@nobelspiritlabs.store",
  phone: "+48 739 256 482",
  location: "Warsaw, Poland"
};

export const getIdentityContext = () => {
  return `
STRICT OWNER IDENTITY:
Name: ${WALID_IDENTITY.fullName}
Role: ${WALID_IDENTITY.role}
Company: ${WALID_IDENTITY.companyName}
Registered Address: ${WALID_IDENTITY.address}
KRS: ${WALID_IDENTITY.krs}
VAT: ${WALID_IDENTITY.vat}
EORI: ${WALID_IDENTITY.eori}
Website: ${WALID_IDENTITY.website}
Email: ${WALID_IDENTITY.email}
Phone: ${WALID_IDENTITY.phone}
Primary Base: ${WALID_IDENTITY.location}
  `;
};
