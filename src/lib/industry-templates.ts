export interface TemplateAsset {
  name: string;
  type: string;
  location: string;
  tag: string;
}

export interface IndustryTemplate {
  id: string;
  label: string;
  assets: TemplateAsset[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "cnc-shop",
    label: "CNC / Machine Shop",
    assets: [
      { name: "CNC Mill #1", type: "CNC Mill", location: "Machine Floor", tag: "CNC-001" },
      { name: "CNC Mill #2", type: "CNC Mill", location: "Machine Floor", tag: "CNC-002" },
      { name: "CNC Lathe #1", type: "CNC Lathe", location: "Machine Floor", tag: "LAT-001" },
      { name: "Manual Lathe", type: "Manual Lathe", location: "Machine Floor", tag: "LAT-002" },
      { name: "Surface Grinder", type: "Grinder", location: "Grinding Area", tag: "GRN-001" },
      { name: "Bandsaw", type: "Saw", location: "Cutting Area", tag: "SAW-001" },
      { name: "Drill Press", type: "Drill Press", location: "Machine Floor", tag: "DRL-001" },
      { name: "Air Compressor", type: "Compressor", location: "Utility Room", tag: "CMP-001" },
      { name: "Coolant System", type: "Coolant", location: "Machine Floor", tag: "CLN-001" },
      { name: "Tool Crib", type: "Storage", location: "Tool Room", tag: "TLS-001" },
    ],
  },
  {
    id: "food-processing",
    label: "Food Processing",
    assets: [
      { name: "Industrial Mixer #1", type: "Mixer", location: "Production Line", tag: "MIX-001" },
      { name: "Industrial Mixer #2", type: "Mixer", location: "Production Line", tag: "MIX-002" },
      { name: "Conveyor Belt", type: "Conveyor", location: "Production Line", tag: "CNV-001" },
      { name: "Commercial Oven", type: "Oven", location: "Baking Area", tag: "OVN-001" },
      { name: "Packaging Machine", type: "Packaging", location: "Packaging Area", tag: "PKG-001" },
      { name: "Walk-In Cooler", type: "Refrigeration", location: "Storage", tag: "CLR-001" },
      { name: "Walk-In Freezer", type: "Refrigeration", location: "Storage", tag: "FRZ-001" },
      { name: "Dishwasher / CIP System", type: "Sanitation", location: "Wash Area", tag: "CIP-001" },
      { name: "Metal Detector", type: "Quality", location: "Packaging Area", tag: "QA-001" },
      { name: "Forklift", type: "Material Handling", location: "Warehouse", tag: "FLK-001" },
    ],
  },
  {
    id: "auto-body",
    label: "Auto Body / Repair",
    assets: [
      { name: "Paint Booth", type: "Paint Booth", location: "Paint Area", tag: "PNT-001" },
      { name: "Frame Machine", type: "Frame Machine", location: "Body Shop", tag: "FRM-001" },
      { name: "2-Post Lift #1", type: "Vehicle Lift", location: "Service Bay 1", tag: "LFT-001" },
      { name: "2-Post Lift #2", type: "Vehicle Lift", location: "Service Bay 2", tag: "LFT-002" },
      { name: "4-Post Alignment Lift", type: "Vehicle Lift", location: "Alignment Bay", tag: "LFT-003" },
      { name: "MIG Welder", type: "Welder", location: "Body Shop", tag: "WLD-001" },
      { name: "Spot Welder", type: "Welder", location: "Body Shop", tag: "WLD-002" },
      { name: "Air Compressor", type: "Compressor", location: "Utility Room", tag: "CMP-001" },
      { name: "Parts Washer", type: "Cleaning", location: "Service Area", tag: "WSH-001" },
      { name: "Tire Machine", type: "Tire Equipment", location: "Tire Bay", tag: "TIR-001" },
    ],
  },
  {
    id: "metal-fab",
    label: "Metal Fabrication",
    assets: [
      { name: "Press Brake", type: "Press Brake", location: "Fab Floor", tag: "BRK-001" },
      { name: "Plasma Cutter", type: "Plasma Cutter", location: "Cutting Area", tag: "PLZ-001" },
      { name: "MIG Welder #1", type: "Welder", location: "Welding Bay 1", tag: "WLD-001" },
      { name: "MIG Welder #2", type: "Welder", location: "Welding Bay 2", tag: "WLD-002" },
      { name: "TIG Welder", type: "Welder", location: "Welding Bay 3", tag: "WLD-003" },
      { name: "Shear", type: "Shear", location: "Cutting Area", tag: "SHR-001" },
      { name: "Ironworker", type: "Ironworker", location: "Fab Floor", tag: "IRN-001" },
      { name: "Overhead Crane", type: "Crane", location: "Fab Floor", tag: "CRN-001" },
      { name: "Bandsaw", type: "Saw", location: "Cutting Area", tag: "SAW-001" },
      { name: "Sandblaster", type: "Finishing", location: "Blast Room", tag: "BLS-001" },
    ],
  },
  {
    id: "plastics",
    label: "Plastics / Injection Molding",
    assets: [
      { name: "Injection Molder #1", type: "Injection Molder", location: "Molding Floor", tag: "INJ-001" },
      { name: "Injection Molder #2", type: "Injection Molder", location: "Molding Floor", tag: "INJ-002" },
      { name: "Extruder", type: "Extruder", location: "Extrusion Area", tag: "EXT-001" },
      { name: "Granulator / Grinder", type: "Grinder", location: "Regrind Area", tag: "GRN-001" },
      { name: "Chiller", type: "Cooling", location: "Utility Room", tag: "CHL-001" },
      { name: "Dryer / Dehumidifier", type: "Material Prep", location: "Material Area", tag: "DRY-001" },
      { name: "Conveyor", type: "Conveyor", location: "Molding Floor", tag: "CNV-001" },
      { name: "Robot Arm", type: "Automation", location: "Molding Floor", tag: "RBT-001" },
      { name: "Mold Storage Rack", type: "Storage", location: "Mold Room", tag: "MLD-001" },
      { name: "Air Compressor", type: "Compressor", location: "Utility Room", tag: "CMP-001" },
    ],
  },
  {
    id: "general-mfg",
    label: "General Manufacturing",
    assets: [
      { name: "Conveyor Line #1", type: "Conveyor", location: "Production Floor", tag: "CNV-001" },
      { name: "Conveyor Line #2", type: "Conveyor", location: "Production Floor", tag: "CNV-002" },
      { name: "Forklift #1", type: "Forklift", location: "Warehouse", tag: "FLK-001" },
      { name: "Forklift #2", type: "Forklift", location: "Warehouse", tag: "FLK-002" },
      { name: "Air Compressor", type: "Compressor", location: "Utility Room", tag: "CMP-001" },
      { name: "HVAC Unit", type: "HVAC", location: "Roof / Utility", tag: "HVC-001" },
      { name: "Generator", type: "Power", location: "Exterior", tag: "GEN-001" },
      { name: "Packaging Station", type: "Packaging", location: "Shipping Area", tag: "PKG-001" },
      { name: "Pallet Jack", type: "Material Handling", location: "Warehouse", tag: "PLT-001" },
      { name: "Dock Leveler", type: "Loading", location: "Shipping Dock", tag: "DCK-001" },
    ],
  },
];
