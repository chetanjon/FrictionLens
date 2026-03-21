-- Rename default_model to preferred_model to match application code
ALTER TABLE user_settings RENAME COLUMN default_model TO preferred_model;
