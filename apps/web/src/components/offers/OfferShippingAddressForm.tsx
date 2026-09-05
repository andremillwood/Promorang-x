import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OfferShippingAddress } from "@/hooks/useOffers";

const emptyAddress: OfferShippingAddress = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal_code: "",
  country: "",
  phone: "",
};

export function OfferShippingAddressForm({
  initial,
  pending,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<OfferShippingAddress> | null;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (address: OfferShippingAddress) => Promise<void> | void;
}) {
  const [address, setAddress] = useState<OfferShippingAddress>({ ...emptyAddress, ...initial });

  const update = (key: keyof OfferShippingAddress, value: string) => {
    setAddress((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(address);
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div>
        <Label htmlFor="ship-name">Name on the package</Label>
        <Input id="ship-name" value={address.name} onChange={(event) => update("name", event.target.value)} required />
      </div>
      <div>
        <Label htmlFor="ship-line1">Street</Label>
        <Input id="ship-line1" value={address.line1} onChange={(event) => update("line1", event.target.value)} required />
      </div>
      <div>
        <Label htmlFor="ship-line2">Apartment or landmark</Label>
        <Input id="ship-line2" value={address.line2 || ""} onChange={(event) => update("line2", event.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ship-city">City</Label>
          <Input id="ship-city" value={address.city} onChange={(event) => update("city", event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ship-region">Region</Label>
          <Input id="ship-region" value={address.region || ""} onChange={(event) => update("region", event.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ship-postal">Postal code</Label>
          <Input id="ship-postal" value={address.postal_code} onChange={(event) => update("postal_code", event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ship-country">Country</Label>
          <Input id="ship-country" value={address.country} onChange={(event) => update("country", event.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="ship-phone">Phone</Label>
        <Input id="ship-phone" value={address.phone || ""} onChange={(event) => update("phone", event.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
