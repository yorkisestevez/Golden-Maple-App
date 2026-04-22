-- Seed DeckCraft Pro settings for Golden Maple Landscaping (contractor zero)
-- Uses DEFAULT_DECKING_SETTINGS values from lib/decking/seed-settings.ts

INSERT INTO decking_settings (contractor_id, materials, crew_rates, permit_fees, engineering_fee, railing_costs, stair_tread_costs, waste_factors, is_enabled)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '[
    {"id":"pine","name":"PT Pine 5/4x6","tier":"Budget","priceRange":"$2.50-$4.00","costPerSqft":3.25,"isComposite":false,"isHidden":false},
    {"id":"brown_pt","name":"Brown PT 5/4x6","tier":"Budget+","priceRange":"$3.00-$4.50","costPerSqft":3.75,"isComposite":false,"isHidden":false},
    {"id":"cedar","name":"Western Red Cedar 5/4x6","tier":"Mid","priceRange":"$5.00-$8.00","costPerSqft":6.50,"isComposite":false,"isHidden":false},
    {"id":"ipe","name":"Ipe Hardwood","tier":"Ultra-Premium","priceRange":"$25.00-$35.00","costPerSqft":28.00,"isComposite":false,"isHidden":false},
    {"id":"trex_enhance","name":"Trex Enhance","tier":"Entry Composite","priceRange":"$4.51/LF","costPerSqft":9.84,"isComposite":true,"isHidden":false},
    {"id":"trex_select","name":"Trex Select","tier":"Mid Composite","priceRange":"$5.99/LF","costPerSqft":13.07,"isComposite":true,"isHidden":false},
    {"id":"trex_transcend","name":"Trex Transcend","tier":"Premium Composite","priceRange":"$9.32/LF","costPerSqft":20.34,"isComposite":true,"isHidden":false},
    {"id":"trex_lineage","name":"Trex Transcend Lineage","tier":"Ultra-Premium Composite","priceRange":"$16.00-$20.00","costPerSqft":18.00,"isComposite":true,"isHidden":false},
    {"id":"deck_venture","name":"Deckorators Venture","tier":"Entry Composite","priceRange":"$7.50-$9.50","costPerSqft":8.50,"isComposite":true,"isHidden":false},
    {"id":"deck_vista","name":"Deckorators Vista","tier":"Mid-Premium Composite","priceRange":"$12.00-$16.00","costPerSqft":14.00,"isComposite":true,"isHidden":false},
    {"id":"deck_voyage","name":"Deckorators Voyage","tier":"Ultra-Premium (MBC)","priceRange":"$18.00-$24.00","costPerSqft":21.00,"isComposite":true,"isHidden":false},
    {"id":"tt_prime","name":"TimberTech Prime (EDGE)","tier":"Entry Composite","priceRange":"$7.00-$9.00","costPerSqft":8.25,"isComposite":true,"isHidden":false},
    {"id":"tt_prime_plus","name":"TimberTech Prime+ (EDGE)","tier":"Entry Composite+","priceRange":"$8.00-$10.00","costPerSqft":9.00,"isComposite":true,"isHidden":false},
    {"id":"tt_premier","name":"TimberTech Premier (EDGE)","tier":"Entry Composite+","priceRange":"$8.50-$10.50","costPerSqft":9.50,"isComposite":true,"isHidden":false},
    {"id":"tt_terrain","name":"TimberTech Terrain (PRO)","tier":"Mid Composite","priceRange":"$10.00-$13.00","costPerSqft":11.50,"isComposite":true,"isHidden":false},
    {"id":"tt_reserve","name":"TimberTech Reserve (PRO)","tier":"Mid-Premium Composite","priceRange":"$12.00-$15.00","costPerSqft":13.50,"isComposite":true,"isHidden":false},
    {"id":"tt_legacy","name":"TimberTech Legacy (PRO)","tier":"Premium Composite","priceRange":"$16.00-$20.00","costPerSqft":18.50,"isComposite":true,"isHidden":false},
    {"id":"tt_landmark_pro","name":"TimberTech Landmark (PRO)","tier":"Premium Composite","priceRange":"$16.00-$20.00","costPerSqft":18.50,"isComposite":true,"isHidden":false},
    {"id":"tt_harvest","name":"TimberTech Harvest (AZEK)","tier":"Premium PVC","priceRange":"$14.00-$18.00","costPerSqft":16.00,"isComposite":true,"isHidden":false},
    {"id":"tt_landmark_azek","name":"TimberTech Landmark (AZEK)","tier":"Ultra-Premium PVC","priceRange":"$18.00-$24.00","costPerSqft":21.00,"isComposite":true,"isHidden":false},
    {"id":"tt_vintage","name":"TimberTech Vintage (AZEK)","tier":"Ultra-Premium PVC","priceRange":"$20.00-$26.00","costPerSqft":23.00,"isComposite":true,"isHidden":false}
  ]'::jsonb,
  '{"Toronto":1350,"Barrie":1180,"Simcoe County":1220,"Burlington-Oakville":1220,"Rural-Other":1220}'::jsonb,
  '{"Toronto":215,"Barrie":225,"Simcoe County":200,"Burlington-Oakville":280,"Rural-Other":175}'::jsonb,
  1500,
  '{"Wood Picket":{"material":35,"install":45,"spacing":6,"postCost":45},"Aluminum":{"material":60,"install":55,"spacing":6,"postCost":95},"Cable":{"material":90,"install":90,"spacing":4,"postCost":120},"Glass Panels":{"material":160,"install":95,"spacing":3,"postCost":150},"Trex Select":{"material":40,"install":55,"spacing":8,"postCost":95},"Trex Transcend":{"material":75,"install":65,"spacing":8,"postCost":145},"Fortress AL13":{"material":50,"install":55,"spacing":8,"postCost":110},"TT Classic":{"material":65,"install":65,"spacing":8,"postCost":130},"TT Impression":{"material":58,"install":55,"spacing":8,"postCost":105}}'::jsonb,
  '{"pine":24,"cedar":40,"composite":85}'::jsonb,
  '{"Straight":1.10,"Diagonal":1.18,"Picture Frame":1.22,"Herringbone":1.25}'::jsonb,
  TRUE
)
ON CONFLICT (contractor_id) DO NOTHING;
