"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logBodyMetricAction } from "../actions";
import { format } from "date-fns";
import { toast } from "sonner";

interface BodyMetricFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BodyMetricForm({ open, onOpenChange }: BodyMetricFormProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState<string>("75.5");
  const [bodyFat, setBodyFat] = useState<string>("15");
  const [waist, setWaist] = useState<string>("82");
  const [chest, setChest] = useState<string>("100");
  const [arms, setArms] = useState<string>("38");
  const [thighs, setThighs] = useState<string>("58");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) {
      toast.error("Weight is required");
      return;
    }

    setLoading(true);
    try {
      const res = await logBodyMetricAction({
        date,
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        arms: arms ? parseFloat(arms) : undefined,
        thighs: thighs ? parseFloat(thighs) : undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Body metrics recorded!");
        onOpenChange(false);
      }
    } catch {
      toast.error("Failed to log metrics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Log Body Metric</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Weight (kg) *</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Body Fat (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="15.0"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px]">Waist (cm)</Label>
              <Input
                type="number"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-[10px]">Chest (cm)</Label>
              <Input
                type="number"
                step="0.5"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-[10px]">Arms (cm)</Label>
              <Input
                type="number"
                step="0.5"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-[10px]">Thighs (cm)</Label>
              <Input
                type="number"
                step="0.5"
                value={thighs}
                onChange={(e) => setThighs(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
