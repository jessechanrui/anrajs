CORE = 3317;
NORMAL = 0;
WARNING = 1;
ERROR = 2;

NodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model.getValue('bounds');
            if (b != null)
                this.figure.setBounds({x:b[0], y:b[1] });
        }
        this.figure.paint();
    },
    createLineEditPart:function () {
        return new AESBLineEditPart();
    },
    createFigure:function () {
        return new NodeFigure();
    }

});

CoreEditPart = anra.gef.NodeEditPart.extend({
    getDragTracker:function () {
        return null;
    },
    createLineEditPart:function () {
        return new AESBLineEditPart();
    },
    createFigure:function () {
        return new CoreFigure();
    }
});

AESBLineEditPart = anra.gef.LineEditPart.extend({
    doActive:function () {
    },
    getTargetAnchor:function () {
        var t = this.target;
        if (t != null)
            return t.getTargetAnchor(this);
        return {x:100, y:100};
    },
    refreshVisual:function () {
        this.figure.paint();
    },
    createFigure:function (model) {
        return new AESBLine(this.source);
    }
});

AESBLine = anra.gef.Line.extend({
        constructor:function (source) {
            this._Line();
            this.source = source;
        },
        mouseIn:function () {
        },
        mouseOut:function () {
        },
        initProp:function () {
            var type;
            switch (this.source.model.getValue('type')) {
                case NORMAL:
                    type = 'rgb(30,146,94)';
                    break;
                case WARNING:
                    type = 'rgb(160,182,32)';
                    break;
                case ERROR:
                    type = 'rgb(151,37,25)';
                    break;
            }
            ;

            this.setAttribute({
                stroke:type,
                'stroke-width':'1.5'
            });
        }
    }
);

CoreFigure = anra.gef.Figure.extend({
    x:null,
    y:null,
    initProp:function () {
        this.setAttribute({
            'fill-opacity':0.8,
            'fill':'#1E78A0'
        });
        this.setBounds({
            x:500, y:600, width:180, height:80
        });
    },
    getTargetAnchor:function (line) {
        if (this.x == null) {
            this.x = this.fattr('x') + this.fattr('width') / 2
        }
        if (this.y == null) {
            this.y = this.fattr('y') + this.fattr('height') / 2
        }
        return {x:this.x, y:this.y};
    }
});

NodeFigure = anra.gef.Figure.extend(anra.svg.Circle).extend({
    createContent:function () {
        var e = new anra.svg.Circle();
        e.initProp = function () {
            e.setAttribute({
                'fill-opacity':0.4,
                'fill':'#1E78A0'
            });
        };
        this.circle1 = e;
        var w = this.bounds.width;
        var w1 = w * 0.75;
        e.setBounds({
            x:0,
            y:0,
            width:w1,
            height:w1
        });
        this.addChild(e);

        e = new anra.svg.Circle();
        e.initProp = function () {
            e.setAttribute({
                'fill-opacity':1,
                'fill':'#1E78A0'
            });
        };
        w1 = w * 0.65;
        e.setBounds({
            x:0,
            y:0,
            width:w1,
            height:w1
        });

        this.addChild(e);

        var group = new anra.svg.Group();
        this.addChild(group);


        var text = new anra.svg.Text();
        text.setText(413);
        group.addChild(text);
        text.setAttribute({
            fill:'rgb(162,136,60)'
        });
        this.num1 = text;

        text = new anra.svg.Text();
        text.setText(134);
        group.addChild(text);
        text.setAttribute({
            fill:'rgb(29,136,90)'
        });
        this.num2 = text;

        var path = new anra.svg.Path();
        var r = w / 2 - 5;
        path.startPoint = {x:-r, y:0};
        path.frags = ['a' + (r + ',' + r) + ' 0 0,1' + (r + ',-' + r)];
        this.addChild(path);
        path.setAttribute({
            'stroke-width':4
        });
        this.arrow1 = path;

        this.layoutManager = new NodeLayout();
    },
    initProp:function () {
        this.setAttribute({
            'fill-opacity':0.2,
            'fill':'#1E78A0'
        });
    },
    mouseIn:function () {
    },
    mouseOut:function () {
    },
    setSelected:function (s) {

    },
    getSourceAnchor:function (line) {
        return {x:this.fattr('cx'), y:this.fattr('cy')};
    },
    getTargetAnchor:function (line) {
        return {x:this.fattr('cx'), y:this.fattr('cy')};
    }
});

var CORE_EDIT_PART;

NodeLayout = anra.svg.Layout.extend({
    layout:function (p) {
        if (CORE_EDIT_PART != null) {
            var x1 = p.bounds.x;
            var y1 = p.bounds.y;
            var r1 = p.bounds.width / 2;
            var x0 = CORE_EDIT_PART.figure.bounds.x;
            var y0 = CORE_EDIT_PART.figure.bounds.y;
            var r0 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            var result = intersection(x0, y0, r0, x1, y1, r1);

            var x2 = result[0] - p.bounds.x;
            var y2 = result[2] - p.bounds.y;

            p.num1.bounds.x = x2;
            p.num1.bounds.y = y2;

            p.num2.bounds.x = result[1] - p.bounds.x;
            p.num2.bounds.y = result[3] - p.bounds.y;

            var k=y2==0?1:(x2/y2/Math.PI*180);
            p.arrow1.setAttribute({'transform':'rotate('+k+' ' + p.fattr('cx') + '  ' + p.fattr('cy') + ')'});

        }
    }
});

MyEditor = anra.gef.Editor.extend({
    models:null,
    editParts:null,
    background:'#191919',
    createEditPart:function (context, model) {
        if (this.editParts == null)
            this.editParts = new Map();

        var part;
        if (model.getValue('type') == CORE) {
            part = new CoreEditPart();
            CORE_EDIT_PART = part;
        } else
            part = new NodeEditPart();
        part.model = model;
        this.editParts.set(model.id, part);
        return part;
    },
    handleInput:function (input) {
        this.models = new Map();
        var nodes = input['nodes'];

        var coreModel = new anra.gef.NodeModel();
        coreModel.setProperties({
            id:0,
            type:CORE
        });
        this.models.set(coreModel.id, coreModel);
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            nm.setProperties(nodes[i]);

            var line = {};
            nm.addSourceLine(line);
            coreModel.addTargetLine(line);

            this.models.set(nodes[i].id, nm);
        }
        return input;
    },
    initRootEditPart:function (editPart) {
        editPart.modelChildren = this.models.values();
        editPart.refresh();
    }
});
