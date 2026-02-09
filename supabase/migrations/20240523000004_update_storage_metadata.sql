-- Function to update storage object metadata
-- Useful for AI captioning or other metadata tagging
create or replace function update_media_metadata(
  file_path text,
  new_metadata jsonb
) returns void as $$
declare
  _bucket_id text := 'media';
begin
  update storage.objects
  set metadata = metadata || new_metadata
  where bucket_id = _bucket_id
  and name = file_path;
end;
$$ language plpgsql security definer;

-- Allow authenticated users (like service role) to call it
grant execute on function update_media_metadata(text, jsonb) to authenticated;
grant execute on function update_media_metadata(text, jsonb) to service_role;
