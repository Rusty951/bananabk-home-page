-- Public object URLs still work for a public bucket, but listing every object
-- through storage.objects is broader than this site needs.

drop policy if exists "Public Read  1vgtc2_0"
  on storage.objects;
