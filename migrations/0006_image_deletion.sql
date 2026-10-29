CREATE TABLE deleted_images (key TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TRIGGER prevent_deleted_images_insert BEFORE INSERT ON products BEGIN
 SELECT CASE WHEN EXISTS (SELECT 1 FROM deleted_images d, json_each(NEW.data, '$.images') j WHERE instr(j.value, '/api/images/' || d.key)>0) OR EXISTS (SELECT 1 FROM deleted_images d WHERE instr(COALESCE(json_extract(NEW.data,'$.cutout'),''),'/api/images/' || d.key)>0) THEN RAISE(ABORT, 'deleted_image') END;
END;
CREATE TRIGGER prevent_deleted_images_update BEFORE UPDATE OF data ON products BEGIN
 SELECT CASE WHEN EXISTS (SELECT 1 FROM deleted_images d, json_each(NEW.data, '$.images') j WHERE instr(j.value, '/api/images/' || d.key)>0) OR EXISTS (SELECT 1 FROM deleted_images d WHERE instr(COALESCE(json_extract(NEW.data,'$.cutout'),''),'/api/images/' || d.key)>0) THEN RAISE(ABORT, 'deleted_image') END;
END;
