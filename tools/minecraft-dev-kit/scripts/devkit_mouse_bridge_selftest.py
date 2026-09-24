from pathlib import Path
import tempfile
from northpoint_mouse_invoker_rules import rewrite_mouse_invokers, ConversionBlock


def main():
    source='import net.minecraft.client.MouseHandler; @Mixin(MouseHandler.class) public interface Bridge { @Invoker("onMove") void move(long window, double x, double y); }'
    with tempfile.TemporaryDirectory() as td:
        root=Path(td);p=root/'Bridge.java';p.write_text(source)
        assert rewrite_mouse_invokers(root)[0]['count']==1
        assert 'default void move(long window, double x, double y)' in p.read_text()
        assert 'x - northpointMouse.xpos(), y - northpointMouse.ypos()' in p.read_text()
        assert not rewrite_mouse_invokers(root)
        for unchanged in [source.replace('net.minecraft.client.MouseHandler','foreign.MouseHandler'),'/* '+source+' */']:
            p.write_text(unchanged);assert not rewrite_mouse_invokers(root);assert p.read_text()==unchanged
        p.write_text(source.replace('double x','double northpointMouse'))
        try:rewrite_mouse_invokers(root)
        except ConversionBlock:pass
        else:raise AssertionError('unsafe local collision')
    print('Mouse invoker bridge: exact owner, retained public API, absolute-to-relative semantics, idempotence and negative controls PASS')
    return 0
if __name__=='__main__':raise SystemExit(main())
