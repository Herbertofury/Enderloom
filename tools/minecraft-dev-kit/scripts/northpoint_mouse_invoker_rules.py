#!/usr/bin/env python3
"""Preserve legacy absolute-coordinate mouse invokers through the public 26.3 API."""
from pathlib import Path
import re
from northpoint_runtime_mixin_rules import mask_comments, param_rows, ConversionBlock
from northpoint_target_26_3_core import _find_matching_java_brace


def rewrite_mouse_invokers(root: Path) -> list[dict]:
    changes=[]
    for path in sorted(root.rglob('*.java')):
        text=path.read_text(encoding='utf-8');masked=mask_comments(text)
        imported=bool(re.search(r'import\s+net\.minecraft\.client\.MouseHandler\s*;',masked))
        owner=r'(?:net\.minecraft\.client\.MouseHandler|MouseHandler)' if imported else r'net\.minecraft\.client\.MouseHandler'
        regions=[]
        for found in re.finditer(r'@(?:org\.spongepowered\.asm\.mixin\.)?Mixin\s*\(\s*(?:value\s*=\s*)?'+owner+r'\.class\s*\)',masked):
            declaration=re.search(r'\binterface\s+\w+[^{}]*\{',masked[found.end():])
            if declaration:
                start=found.end()+declaration.end()-1
                end=_find_matching_java_brace(text,start)
                if end is not None:regions.append((start,end))
        pattern=r'@(?:org\.spongepowered\.asm\.mixin\.gen\.)?Invoker\s*\(\s*"onMove"\s*\)\s*(?:public\s+)?void\s+(\w+)\s*\(([^()]*)\)\s*;'
        edits=[]
        for found in re.finditer(pattern,masked):
            if not any(start<found.start()<end for start,end in regions):continue
            params=param_rows(found[2])
            if [kind for kind,name in params]!=['long','double','double']:continue
            if any(name=='northpointMouse' for kind,name in params):raise ConversionBlock('mouse invoker variable collision')
            window,x,y=[name for kind,name in params]
            declaration=', '.join(kind+' '+name for kind,name in params)
            replacement=('default void '+found[1]+'('+declaration+') {\n'
                '        net.minecraft.client.MouseHandler northpointMouse = (net.minecraft.client.MouseHandler)(Object)this;\n'
                '        northpointMouse.onMove('+window+', '+x+', '+y+', '+x+' - northpointMouse.xpos(), '+y+' - northpointMouse.ypos());\n'
                '    }')
            edits.append((found.start(),found.end(),replacement))
        for start,end,replacement in reversed(edits):text=text[:start]+replacement+text[end:]
        if edits:
            path.write_text(text,encoding='utf-8')
            changes.append({'rule':'minecraft-26.3-mouse-invoker-absolute-bridge','path':path.relative_to(root).as_posix(),'count':len(edits)})
    return changes
