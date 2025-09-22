import os
import sys

def get_file_tree(startpath, exclude_files=None):
    """Generates a string representation of the directory tree."""
    if exclude_files is None:
        exclude_files = []
    
    tree_str = f"{os.path.basename(startpath)}\n"
    for root, dirs, files in os.walk(startpath):
        # Exclude common build and version control directories from the tree
        dirs[:] = [d for d in dirs if d not in ['.git', 'dist', 'build']]
        
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * level
        tree_str += f"{indent}{os.path.basename(root)}/\n"
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f not in exclude_files:
                tree_str += f"{subindent}{f}\n"
    return tree_str

def get_file_contents(startpath, exclude_files=None):
    """
    Traverses the directory, reads the content of each file,
    and formats it as a single string.
    """
    if exclude_files is None:
        exclude_files = []
    
    contents_str = ""
    # List of directories to skip
    skip_dirs = ['.git', 'dist', 'build']

    for root, dirs, files in os.walk(startpath):
        # Modify the list of directories in place to skip certain ones
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for f in files:
            # Skip the file if its name is in the exclude list
            if f in exclude_files:
                continue
            
            file_path = os.path.join(root, f)
            
            try:
                # Open the file and read its content using utf-8 encoding
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Format the output: path, followed by content
                contents_str += f"{file_path}\n\n{content}\n\n"
                
            except UnicodeDecodeError:
                # Fallback to a different encoding if utf-8 fails
                try:
                    with open(file_path, 'r', encoding='latin-1') as file:
                        content = file.read()
                    contents_str += f"{file_path}\n\n{content}\n\n"
                except Exception as e:
                    contents_str += f"{file_path}\n\n[Error reading file: {e}]\n\n"
            except Exception as e:
                # Catch any other I/O errors
                contents_str += f"{file_path}\n\n[Error reading file: {e}]\n\n"
    
    return contents_str

def main():
    """Main function to generate the folder tree and file contents."""
    # Define the target and output folder paths
    target_folder = r"C:\Users\shop\Desktop\adcenter"
    output_folder = r"C:\Users\shop\Desktop\adcenter"
    output_file_name = "adcenter_structure_and_contents.txt"
    script_file_name = "generate_adcenter_structure.py"
    output_file_path = os.path.join(output_folder, output_file_name)
    
    # Files to be excluded from the output
    excluded_files = [output_file_name, script_file_name]

    # Check if the target folder exists
    if not os.path.isdir(target_folder):
        print(f"Error: The specified folder does not exist: {target_folder}")
        sys.exit(1)

    # Get the file tree and all file contents, excluding the output files
    tree = get_file_tree(target_folder, excluded_files)
    contents = get_file_contents(target_folder, excluded_files)

    # Combine the outputs into a single string
    combined_output = "Folder Tree:\n" + "="*20 + "\n" + tree + "\n\n" + "File Contents:\n" + "="*20 + "\n" + contents

    # Write the combined output to a text file
    try:
        with open(output_file_path, "w", encoding="utf-8") as f:
            f.write(combined_output)
        print(f"Successfully saved the folder structure and contents to:\n{output_file_path}")
    except Exception as e:
        print(f"An error occurred while writing the file: {e}")

if __name__ == "__main__":
    main()